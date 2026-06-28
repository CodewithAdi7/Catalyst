from datetime import datetime
from enum import Enum
from pathlib import Path

from pydantic import BaseModel, Field


class MicroTask(BaseModel):
    id: int
    title: str
    duration_minutes: int = 15
    description: str


class AdditionalFile(BaseModel):
    file_path: str
    boilerplate_code: str


class CodeScaffold(BaseModel):
    terminal_commands: list[str]
    file_path: str  # Primary file path (for backward compatibility)
    boilerplate_code: str  # Primary boilerplate code
    documentation_links: list[str]
    user_guidance: str = ""  # Clear, non-technical guidance for the user
    design_inspiration: str = ""  # Design tips and best practices
    additional_files: list[AdditionalFile] = Field(default_factory=list)


class CalendarEvent(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    description: str | None = None
    location: str | None = None


class DeadlineRisk(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskType(str, Enum):
    coding = "coding"
    writing = "writing"
    general = "general"


class DeadlineAssessment(BaseModel):
    event_title: str
    deadline: datetime
    related_micro_task_ids: list[int] = Field(default_factory=list)
    can_meet_deadline: bool
    risk: DeadlineRisk
    reasoning: str
    recommended_order: list[int] = Field(default_factory=list)


class SprintInitializationRequest(BaseModel):
    monolithic_task: str
    tech_stack: list[str]
    estimated_total_hours: int = 2
    calendar_events: list[CalendarEvent] = Field(default_factory=list)
    task_type: TaskType = TaskType.coding
    preferred_app: str | None = None


class SprintInitializationResponse(BaseModel):
    sprint_id: str
    timeline: list[MicroTask]
    first_step_scaffold: CodeScaffold
    deadline_assessments: list[DeadlineAssessment] = Field(default_factory=list)
    app_installed: bool = True


class NextStepRequest(BaseModel):
    sprint_id: str
    completed_task_id: int
    next_task_id: int
    tech_stack: list[str]
    next_task_description: str
    task_type: TaskType = TaskType.coding
    preferred_app: str | None = None


class CalendarDeadlineRequest(BaseModel):
    sprint_id: str | None = None
    monolithic_task: str
    tech_stack: list[str]
    timeline: list[MicroTask]
    calendar_events: list[CalendarEvent]


class CalendarDeadlineResponse(BaseModel):
    assessments: list[DeadlineAssessment]


class TaskCandidate(BaseModel):
    id: int
    title: str
    description: str
    tech_stack: list[str] = Field(default_factory=list)
    estimated_total_hours: int = 2
    deadline: datetime
    task_type: TaskType = TaskType.coding
    preferred_app: str | None = None


class PrioritizedTask(BaseModel):
    id: int
    title: str
    deadline: datetime
    priority_rank: int
    urgency_score: int = Field(ge=1, le=100)
    risk: DeadlineRisk
    reasoning: str
    recommended_start: datetime | None = None


class TaskPrioritizationRequest(BaseModel):
    tasks: list[TaskCandidate]


class TaskPrioritizationResponse(BaseModel):
    prioritized_tasks: list[PrioritizedTask]


class MaterializeScaffoldRequest(BaseModel):
    sprint_id: str
    task_title: str
    task_type: TaskType
    scaffold: CodeScaffold
    preferred_app: str | None = None
    open_app: bool = True


class MaterializeScaffoldResponse(BaseModel):
    materialized_path: Path
    workspace_path: Path
    launch_command: str | None = None
    opened: bool = False
    message: str
    app_installed: bool = True


class TaskStatusRequest(BaseModel):
    sprint_id: str
    task_id: int
    workspace_path: str


class TaskStatusResponse(BaseModel):
    task_id: int
    is_completed: bool
    completion_percentage: int
    modified_files: list[str]
    next_task_id: int | None = None
    next_task_guidance: str = ""
    message: str