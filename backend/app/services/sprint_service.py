import logging
import os
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from pydantic import BaseModel

from app.models.sprint import (
    CalendarDeadlineRequest,
    CodeScaffold,
    DeadlineAssessment,
    DeadlineRisk,
    MaterializeScaffoldRequest,
    MaterializeScaffoldResponse,
    MicroTask,
    NextStepRequest,
    PrioritizedTask,
    SprintInitializationRequest,
    SprintInitializationResponse,
    TaskPrioritizationRequest,
    TaskPrioritizationResponse,
    TaskStatusRequest,
    TaskStatusResponse,
    TaskType,
)
from app.services.gemini import GeminiService
from app.services.prompts import (
    CALENDAR_PROMPT_CONSTRAINT,
    SCAFFOLDING_PROMPT_CONSTRAINT,
    SLICING_PROMPT_CONSTRAINT,
)

logger = logging.getLogger(__name__)


class TimelineResponse(BaseModel):
    timeline: list[MicroTask]


class DeadlineAssessmentsResponse(BaseModel):
    assessments: list[DeadlineAssessment]


class SprintService:
    def __init__(self, gemini: GeminiService | None = None) -> None:
        self.gemini = gemini or GeminiService()
        self.workspace_root = Path.cwd() / "generated_workspace"

    async def initialize_sprint(
        self, request: SprintInitializationRequest
    ) -> SprintInitializationResponse:
        timeline = await self.slice_task(request)
        first_task = timeline[0]
        first_step_scaffold = await self.generate_scaffold(
            tech_stack=request.tech_stack,
            micro_task=first_task,
            sprint_context=request.monolithic_task,
            task_type=request.task_type,
        )
        deadline_assessments = await self.assess_calendar_deadlines(
            CalendarDeadlineRequest(
                sprint_id=None,
                monolithic_task=request.monolithic_task,
                tech_stack=request.tech_stack,
                timeline=timeline,
                calendar_events=request.calendar_events,
            )
        )

        return SprintInitializationResponse(
            sprint_id=str(uuid4()),
            timeline=timeline,
            first_step_scaffold=first_step_scaffold,
            deadline_assessments=deadline_assessments,
        )

    async def next_step_scaffold(self, request: NextStepRequest) -> CodeScaffold:
        return await self.generate_scaffold(
            tech_stack=request.tech_stack,
            micro_task=MicroTask(
                id=request.next_task_id,
                title=f"Micro-task {request.next_task_id}",
                description=request.next_task_description,
            ),
            sprint_context=f"Sprint {request.sprint_id}; completed task {request.completed_task_id}",
            task_type=request.task_type,
        )

    async def prioritize_tasks(
        self, request: TaskPrioritizationRequest
    ) -> TaskPrioritizationResponse:
        if not request.tasks:
            return TaskPrioritizationResponse(prioritized_tasks=[])

        if self.gemini.is_configured:
            try:
                return await self.gemini.generate_structured(
                    system_prompt=(
                        "You are an AI sprint commander. Prioritize the user's tasks by deadline pressure, "
                        "estimated effort, and whether the task needs scaffolding before execution. Return the "
                        "tasks in the exact order the user should attack them."
                    ),
                    user_prompt=(
                        f"Current time: {datetime.now(timezone.utc).isoformat()}\n"
                        f"Tasks JSON: {[task.model_dump(mode='json') for task in request.tasks]}\n"
                        "Use urgency_score 1-100. Earlier deadlines and longer estimates should increase urgency."
                    ),
                    response_model=TaskPrioritizationResponse,
                )
            except Exception as exc:
                logger.warning("Gemini prioritization failed; using fallback priority: %s", exc)

        return self._fallback_prioritization(request)

    async def slice_task(self, request: SprintInitializationRequest) -> list[MicroTask]:
        task_count = max(1, request.estimated_total_hours * 4)
        if not self.gemini.is_configured:
            return self._fallback_timeline(request.monolithic_task, request.tech_stack, task_count, request.task_type)

        try:
            result = await self.gemini.generate_structured(
                system_prompt=SLICING_PROMPT_CONSTRAINT,
                user_prompt=(
                    f"Task type: {request.task_type}\n"
                    f"Task: {request.monolithic_task}\n"
                    f"Tech stack or tools: {', '.join(request.tech_stack)}\n"
                    f"Estimated hours: {request.estimated_total_hours}\n"
                    f"Return exactly {task_count} milestones, each with duration_minutes set to 15."
                ),
                response_model=TimelineResponse,
            )
            return [task.model_copy(update={"duration_minutes": 15}) for task in result.timeline[:task_count]]
        except Exception as exc:
            logger.warning("Gemini slicing failed; using fallback timeline: %s", exc)
            return self._fallback_timeline(request.monolithic_task, request.tech_stack, task_count, request.task_type)

    async def generate_scaffold(
        self,
        *,
        tech_stack: list[str],
        micro_task: MicroTask,
        sprint_context: str,
        task_type: TaskType = TaskType.coding,
    ) -> CodeScaffold:
        if not self.gemini.is_configured:
            return self._fallback_scaffold(tech_stack, micro_task, task_type)

        try:
            return await self.gemini.generate_structured(
                system_prompt=SCAFFOLDING_PROMPT_CONSTRAINT,
                user_prompt=(
                    f"Task type: {task_type}\n"
                    f"Sprint context: {sprint_context}\n"
                    f"Tech stack or tools: {', '.join(tech_stack)}\n"
                    f"Current micro-task: {micro_task.model_dump_json()}\n"
                    "For writing tasks, return an outline or opening draft in boilerplate_code and target a document file. "
                    "For coding tasks, return executable starter code."
                ),
                response_model=CodeScaffold,
            )
        except Exception as exc:
            logger.warning("Gemini scaffolding failed; using fallback scaffold: %s", exc)
            return self._fallback_scaffold(tech_stack, micro_task, task_type)

    async def assess_calendar_deadlines(
        self, request: CalendarDeadlineRequest
    ) -> list[DeadlineAssessment]:
        if not request.calendar_events:
            return []

        if not self.gemini.is_configured:
            return self._fallback_deadline_assessments(request)

        try:
            result = await self.gemini.generate_structured(
                system_prompt=CALENDAR_PROMPT_CONSTRAINT,
                user_prompt=(
                    f"Task: {request.monolithic_task}\n"
                    f"Tech stack: {', '.join(request.tech_stack)}\n"
                    f"Timeline JSON: {[task.model_dump() for task in request.timeline]}\n"
                    f"Calendar events JSON: {[event.model_dump(mode='json') for event in request.calendar_events]}\n"
                    "Assess only events that look like deadlines, demos, submissions, reviews, exams, or meetings tied to this task."
                ),
                response_model=DeadlineAssessmentsResponse,
            )
            return result.assessments
        except Exception as exc:
            logger.warning("Gemini calendar assessment failed; using fallback assessment: %s", exc)
            return self._fallback_deadline_assessments(request)

    def materialize_scaffold(
        self, request: MaterializeScaffoldRequest
    ) -> MaterializeScaffoldResponse:
        workspace = self.workspace_root / self._slugify(f"{request.sprint_id}-{request.task_title}")
        workspace.mkdir(parents=True, exist_ok=True)

        # Execute terminal commands to set up the project
        setup_status = self._execute_setup_commands(workspace, request.scaffold.terminal_commands)
        
        # Create primary file
        relative_path = self._safe_relative_path(request.scaffold.file_path, request.task_type)
        target_path = workspace / relative_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        content = request.scaffold.boilerplate_code

        app = (request.preferred_app or "").lower()
        if request.task_type == TaskType.writing and "word" in app:
            target_path = target_path.with_suffix(".rtf")
            content = self._plain_text_to_rtf(content)
        elif request.task_type == TaskType.writing and target_path.suffix.lower() not in {".md", ".txt", ".rtf"}:
            target_path = target_path.with_suffix(".md")

        target_path.write_text(content, encoding="utf-8")

        # Create additional files from the scaffold
        files_created = [target_path]
        for file_path, file_content in request.scaffold.additional_files.items():
            additional_file_path = workspace / file_path
            additional_file_path.parent.mkdir(parents=True, exist_ok=True)
            additional_file_path.write_text(file_content, encoding="utf-8")
            files_created.append(additional_file_path)

        # Build user-friendly message with guidance
        launch_command = self._launch_command(request, workspace, target_path)
        opened = False
        
        # Construct the message with setup status, guidance, and design inspiration
        message_parts = [f"✅ Project ready!"]
        
        if request.scaffold.design_inspiration:
            message_parts.append(f"\n🎨 **Design Ideas**: {request.scaffold.design_inspiration}")
        
        if request.scaffold.user_guidance:
            message_parts.append(f"\n📝 **What to do next**: {request.scaffold.user_guidance}")
        
        message_parts.append(f"\n{len(files_created)} file(s) created ready for you to code!")
        
        message = "".join(message_parts)
        
        if request.open_app:
            opened = self._try_open_app(request, workspace, target_path)
            message += f"\n✨ {request.preferred_app or 'VS Code'} is opening your project..."

        return MaterializeScaffoldResponse(
            materialized_path=target_path,
            workspace_path=workspace,
            launch_command=launch_command,
            opened=opened,
            message=message,
        )

    def check_task_status(self, request: TaskStatusRequest) -> TaskStatusResponse:
        """
        Check if user has completed the current task by detecting file modifications.
        """
        workspace = Path(request.workspace_path)
        
        # Common task files to check based on file type
        task_files_to_check = [
            "src/components/*.tsx",
            "src/**/*.tsx",
            "src/**/*.ts",
            "*.py",
            "src/**/*.jsx",
            "*.md",
        ]
        
        # Get all files that match the patterns
        matching_files = []
        for pattern in task_files_to_check:
            matching_files.extend([str(p.relative_to(workspace)) for p in workspace.glob(pattern) if p.is_file()])
        
        # Check for task completion
        is_completed, modified_files, completion_pct = self._detect_task_completion(
            workspace, 
            matching_files[:3] if matching_files else ["src/components/MicroTaskStarter.tsx"]
        )
        
        # Prepare message with encouragement
        if is_completed:
            message = f"🎉 Great work! Task {request.task_id} is complete! Ready to move to the next step?"
        else:
            message = f"📝 Keep working! {completion_pct}% complete. {len(modified_files)}/{len(matching_files)} file(s) updated."
        
        return TaskStatusResponse(
            task_id=request.task_id,
            is_completed=is_completed,
            completion_percentage=completion_pct,
            modified_files=modified_files,
            next_task_id=request.task_id + 1 if is_completed else None,
            message=message,
        )

    @staticmethod
    def _execute_setup_commands(workspace: Path, commands: list[str]) -> str:
        """
        Execute setup commands in the workspace directory.
        Handles both simple commands and npm/python project setup.
        """
        if not commands:
            return "No setup commands to execute."
        
        try:
            executed_commands = []
            failed_commands = []
            current_cwd = workspace
            
            for command in commands:
                try:
                    logger.info(f"Executing setup command: {command} in {current_cwd}")
                    
                    # Special handling for 'cd' commands
                    if command.strip().lower().startswith("cd "):
                        target_dir = command.replace("cd ", "").strip()
                        current_cwd = workspace / target_dir
                        current_cwd.mkdir(parents=True, exist_ok=True)
                        logger.info(f"Changed working directory to: {current_cwd}")
                        executed_commands.append(f"✓ cd {target_dir}")
                        continue
                    
                    # For interactive npm create commands, use stdin to auto-answer
                    use_stdin = "npm create" in command.lower()
                    stdin_input = None
                    if use_stdin:
                        # Auto-answer npm create prompts with Enter (default)
                        stdin_input = "\n" * 10
                    
                    result = subprocess.run(
                        command,
                        shell=True,
                        cwd=str(current_cwd),
                        input=stdin_input,
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    
                    # Consider success if returncode is 0, or for npm create if dir was created
                    is_success = result.returncode == 0 or ("npm create" in command.lower() and (current_cwd / "package.json").exists())
                    
                    if is_success:
                        executed_commands.append(f"✓ {command[:60]}..." if len(command) > 60 else f"✓ {command}")
                        logger.info(f"Command succeeded: {command}")
                    else:
                        # Still log but be lenient for npm create
                        if "npm create" in command.lower():
                            executed_commands.append(f"✓ {command[:60]}..." if len(command) > 60 else f"✓ {command}")
                            logger.warning(f"npm create command returned {result.returncode}, but may have succeeded: {result.stderr[:100] if result.stderr else 'N/A'}")
                        else:
                            failed_commands.append(f"✗ {command[:60]}...: {result.stderr[:80] if result.stderr else 'Unknown error'}" if len(command) > 60 else f"✗ {command}: {result.stderr[:80] if result.stderr else 'Unknown error'}")
                            logger.warning(f"Command failed: {command}\nStderr: {result.stderr}")
                
                except subprocess.TimeoutExpired:
                    failed_commands.append(f"✗ {command[:60]}...: Timeout" if len(command) > 60 else f"✗ {command}: Timeout")
                    logger.error(f"Command timeout: {command}")
                except Exception as cmd_exc:
                    failed_commands.append(f"✗ {command[:60]}...: {str(cmd_exc)[:60]}" if len(command) > 60 else f"✗ {command}: {str(cmd_exc)[:60]}")
                    logger.error(f"Command exception: {command} - {cmd_exc}")
            
            # Build status message
            status_parts = []
            if executed_commands:
                status_parts.append(f"✅ Executed {len(executed_commands)} setup step(s) successfully")
            if failed_commands:
                status_parts.append(f"⚠️  {len(failed_commands)} step(s) had issues")
            if not status_parts:
                status_parts.append("⚠️ No commands were executed")
            
            status = ". ".join(status_parts) + ". Project ready for development!"
            return status
            
        except Exception as exc:
            logger.error(f"Setup execution failed: {exc}")
            return f"⚠️ Setup error: {str(exc)[:150]}"

    @staticmethod
    def _detect_task_completion(workspace: Path, task_files: list[str]) -> tuple[bool, list[str], int]:
        """
        Detect if user has completed a task by checking if task files have been modified.
        Returns: (is_completed, modified_files, completion_percentage)
        """
        modified_files = []
        if not workspace.exists():
            return False, modified_files, 0
        
        # Check which task files have been modified (have content beyond boilerplate)
        for task_file in task_files:
            file_path = workspace / task_file
            if file_path.exists():
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                # Check if file has meaningful content beyond comments and structure
                non_comment_lines = [
                    line for line in content.split("\n")
                    if line.strip() and not line.strip().startswith("//") and not line.strip().startswith("#")
                ]
                if len(non_comment_lines) > 5:  # More than just boilerplate
                    modified_files.append(task_file)
        
        completion_percentage = int((len(modified_files) / max(len(task_files), 1)) * 100)
        is_completed = len(modified_files) >= len(task_files)
        
        return is_completed, modified_files, completion_percentage

    @staticmethod
    def _fallback_timeline(
        monolithic_task: str, tech_stack: list[str], task_count: int, task_type: TaskType
    ) -> list[MicroTask]:
        stack = ", ".join(tech_stack) or "the selected tools"
        coding_verbs = [
            "Create the minimal project shell",
            "Implement the first visible user-facing section",
            "Wire the primary state and data shape",
            "Build the core interaction path",
            "Add responsive styling for the main viewport",
            "Handle empty, loading, and error states",
            "Connect the next reusable component",
            "Run and fix the first end-to-end smoke test",
        ]
        writing_verbs = [
            "Write the thesis and first paragraph hook",
            "Draft the section-by-section outline",
            "Fill the strongest evidence paragraph",
            "Write the counterpoint or limitation paragraph",
            "Create the transition sentences between sections",
            "Draft the conclusion with a clear final claim",
            "Add citations or source notes placeholders",
            "Do a fast clarity pass on the draft",
        ]
        verbs = writing_verbs if task_type == TaskType.writing else coding_verbs
        return [
            MicroTask(
                id=index + 1,
                title=verbs[index % len(verbs)],
                description=(
                    f"For '{monolithic_task}', use {stack} to complete one concrete, shippable "
                    "15-minute increment with no planning-only work."
                ),
            )
            for index in range(task_count)
        ]

    @staticmethod
    def _fallback_scaffold(tech_stack: list[str], micro_task: MicroTask, task_type: TaskType) -> CodeScaffold:
        if task_type == TaskType.writing:
            return CodeScaffold(
                terminal_commands=["Open the generated markdown file in Word, Google Docs, or your writing app."],
                file_path="draft_starter.md",
                boilerplate_code=(
                    f"# {micro_task.title}\n\n"
                    "## Opening angle\n"
                    "Start with a direct, specific claim about the topic. Replace this with your real hook.\n\n"
                    "## Core idea\n"
                    f"- Micro-task: {micro_task.description}\n"
                    "- Main claim: TODO\n"
                    "- Evidence or example: TODO\n"
                    "- Why it matters: TODO\n\n"
                    "## First draft paragraph\n"
                    "TODO: Write 6-8 sentences without editing mid-flow.\n"
                ),
                documentation_links=[
                    "https://support.microsoft.com/word",
                    "https://owl.purdue.edu/owl/general_writing/index.html",
                ],
            )

        is_frontend = any(item.lower() in {"react", "next.js", "nextjs"} for item in tech_stack)
        return CodeScaffold(
            terminal_commands=(
                ["npm create vite@latest . --template react-ts --force", "npm install"]
                if is_frontend
                else ["python -m venv .venv", ".venv\\Scripts\\pip install -r requirements.txt" if os.name == 'nt' else ".venv/bin/pip install -r requirements.txt"]
            ),
            file_path="src/components/MicroTaskStarter.tsx" if is_frontend else "app/feature.py",
            boilerplate_code=(
                "type Props = { title: string; onComplete: () => void };\n\n"
                "export function MicroTaskStarter({ title, onComplete }: Props) {\n"
                "  return (\n"
                "    <section className=\"rounded border p-4\">\n"
                f"      <h2>{micro_task.title}</h2>\n"
                "      <p>{title}</p>\n"
                "      <button onClick={onComplete}>Complete step</button>\n"
                "    </section>\n"
                "  );\n"
                "}\n"
            )
            if is_frontend
            else (
                f"def run_step() -> str:\n"
                f"    \"\"\"Starter for: {micro_task.title}\"\"\"\n"
                f"    # TODO: implement {micro_task.description}\n"
                f"    return \"step ready\"\n"
            ),
            documentation_links=[
                "https://ai.google.dev/gemini-api/docs/structured-output",
                "https://fastapi.tiangolo.com/",
                "https://react.dev/reference/react" if is_frontend else "https://docs.python.org/3/",
            ],
        )

    @staticmethod
    def _fallback_deadline_assessments(
        request: CalendarDeadlineRequest,
    ) -> list[DeadlineAssessment]:
        total_minutes = sum(task.duration_minutes for task in request.timeline)
        ordered_ids = [task.id for task in request.timeline]
        assessments: list[DeadlineAssessment] = []
        for event in request.calendar_events:
            title = event.title.lower()
            deadline_like = any(
                keyword in title
                for keyword in ["deadline", "submit", "submission", "demo", "review", "deliver", "present"]
            )
            if not deadline_like:
                continue

            assessments.append(
                DeadlineAssessment(
                    event_title=event.title,
                    deadline=event.start_time,
                    related_micro_task_ids=ordered_ids,
                    can_meet_deadline=True,
                    risk=DeadlineRisk.medium if total_minutes > 120 else DeadlineRisk.low,
                    reasoning=(
                        f"The sprint currently needs about {total_minutes} focused minutes. "
                        "Gemini is unreachable or not configured, so this is a keyword-based deadline estimate."
                    ),
                    recommended_order=ordered_ids,
                )
            )
        return assessments

    @staticmethod
    def _fallback_prioritization(request: TaskPrioritizationRequest) -> TaskPrioritizationResponse:
        now = datetime.now(timezone.utc)
        sorted_tasks = sorted(
            request.tasks,
            key=lambda task: (task.deadline, -task.estimated_total_hours),
        )
        prioritized: list[PrioritizedTask] = []
        for index, task in enumerate(sorted_tasks, start=1):
            deadline = task.deadline if task.deadline.tzinfo else task.deadline.replace(tzinfo=timezone.utc)
            hours_left = max((deadline - now).total_seconds() / 3600, 0.1)
            effort_minutes = max(task.estimated_total_hours * 60, 15)
            pressure = effort_minutes / max(hours_left * 60, 1)
            urgency = min(100, max(1, round(35 + pressure * 65 + (len(sorted_tasks) - index) * 2)))
            risk = DeadlineRisk.high if pressure >= 0.75 else DeadlineRisk.medium if pressure >= 0.35 else DeadlineRisk.low
            prioritized.append(
                PrioritizedTask(
                    id=task.id,
                    title=task.title,
                    deadline=task.deadline,
                    priority_rank=index,
                    urgency_score=urgency,
                    risk=risk,
                    reasoning=(
                        f"Deadline is {task.deadline.isoformat()} with about {task.estimated_total_hours} hour(s) of work. "
                        "Fallback priority sorts by nearest deadline and effort pressure."
                    ),
                    recommended_start=now,
                )
            )
        return TaskPrioritizationResponse(prioritized_tasks=prioritized)

    @staticmethod
    def _slugify(value: str) -> str:
        cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-.").lower()
        return cleaned[:80] or "sprint-workspace"

    @staticmethod
    def _safe_relative_path(file_path: str, task_type: TaskType) -> Path:
        fallback = "draft_starter.md" if task_type == TaskType.writing else "starter.py"
        clean = file_path.replace("\\", "/").strip().lstrip("/") or fallback
        path = Path(clean)
        if path.is_absolute() or ".." in path.parts:
            return Path(fallback)
        return path

    @staticmethod
    def _launch_command(request: MaterializeScaffoldRequest, workspace: Path, target_path: Path) -> str:
        app = (request.preferred_app or "default").lower()
        target = workspace if app in {"vscode", "cursor", "pycharm"} else target_path
        executable = SprintService._resolve_app_executable(app)
        if executable:
            return f'"{executable}" "{target}"'
        if app == "default":
            return f'start "" "{target_path}"'
        return f'{app} "{target}"'

    def _try_open_app(self, request: MaterializeScaffoldRequest, workspace: Path, target_path: Path) -> bool:
        app = (request.preferred_app or "default").lower()
        target = workspace if app in {"vscode", "cursor", "pycharm"} else target_path

        try:
            if app == "default":
                return self._open_default(target_path)

            executable = self._resolve_app_executable(app)
            if executable:
                subprocess.Popen([str(executable), str(target)], shell=False)
                return True

            if app == "word" and os.name == "nt":
                subprocess.Popen(["cmd", "/c", "start", "", "winword", str(target_path)], shell=False)
                return True

            logger.warning("No launcher found for preferred app: %s", app)
            return False
        except Exception as exc:
            logger.warning("App launch failed: %s", exc)
            return False

    @staticmethod
    def _open_default(target_path: Path) -> bool:
        if os.name == "nt":
            os.startfile(str(target_path))  # type: ignore[attr-defined]
            return True
        subprocess.Popen(["xdg-open", str(target_path)], shell=False)
        return True

    @staticmethod
    def _resolve_app_executable(app: str) -> Path | str | None:
        command_names = {
            "vscode": ["code", "code.cmd"],
            "cursor": ["cursor", "cursor.cmd"],
            "pycharm": ["pycharm64", "pycharm64.exe", "pycharm"],
            "word": ["winword", "winword.exe"],
            "notepad": ["notepad", "notepad.exe"],
        }
        for command in command_names.get(app, []):
            found = shutil.which(command)
            if found:
                return found

        if os.name != "nt":
            return None

        local_app_data = Path(os.environ.get("LOCALAPPDATA", ""))
        program_files = [
            Path(os.environ.get("ProgramFiles", "")),
            Path(os.environ.get("ProgramFiles(x86)", "")),
        ]
        candidates = {
            "vscode": [
                local_app_data / "Programs" / "Microsoft VS Code" / "Code.exe",
                *[root / "Microsoft VS Code" / "Code.exe" for root in program_files],
            ],
            "cursor": [
                local_app_data / "Programs" / "Cursor" / "Cursor.exe",
                *[root / "Cursor" / "Cursor.exe" for root in program_files],
            ],
            "pycharm": [
                *[root / "JetBrains" / "PyCharm Community Edition 2024.3" / "bin" / "pycharm64.exe" for root in program_files],
                *[root / "JetBrains" / "PyCharm Professional Edition 2024.3" / "bin" / "pycharm64.exe" for root in program_files],
            ],
            "word": [
                *[root / "Microsoft Office" / "root" / "Office16" / "WINWORD.EXE" for root in program_files],
            ],
            "notepad": [Path(os.environ.get("WINDIR", "C:\\Windows")) / "System32" / "notepad.exe"],
        }
        for candidate in candidates.get(app, []):
            if candidate and candidate.exists():
                return candidate
        return None

    @staticmethod
    def _plain_text_to_rtf(text: str) -> str:
        escaped = text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")
        escaped = escaped.replace("\r\n", "\n").replace("\n", "\\par\n")
        return "{\\rtf1\\ansi\\deff0\n" + escaped + "\n}"
