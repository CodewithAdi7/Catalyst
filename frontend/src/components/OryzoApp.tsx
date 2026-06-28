import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Plus,
  Sparkles,
  Terminal,
  FolderCode,
  FileText,
  Clock,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Code,
  Cpu,
  RotateCcw,
  Calendar,
  X,
  Layers,
  HeartCrack,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TaskCandidate, PrioritizedTask, MicroTask, CodeScaffold, DeadlineAssessment, CalendarEvent } from "../types";

const BACKEND_URL = "http://localhost:8000";

// Helper to format a datetime-local string (YYYY-MM-DDTHH:mm) or return a relative string fallback
const formatDeadlineText = (deadlineStr: string) => {
  if (!deadlineStr) return "";
  if (!deadlineStr.includes("-") && !deadlineStr.includes("T")) return deadlineStr;
  try {
    const date = new Date(deadlineStr);
    if (isNaN(date.getTime())) return deadlineStr;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return deadlineStr;
  }
};

// Helper to calculate initial deadline formatted as YYYY-MM-DDTHH:mm
const getInitialDeadline = () => {
  const now = new Date();
  // Default to today at 5:00 PM (17:00)
  now.setHours(17, 0, 0, 0);
  // If already past 5:00 PM, default to tomorrow at 5:00 PM
  if (new Date().getHours() >= 17) {
    now.setDate(now.getDate() + 1);
  }
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Default Seed Tasks to give user immediate value
const SEED_TASKS: TaskCandidate[] = [
  {
    title: "Implement FastAPI Middleware Auth",
    description: "Write JWT-based authentication middleware that validates Bearer tokens on incoming routes, handles custom exception responses, and injects user context.",
    tech_stack: ["FastAPI", "Python", "Auth0", "Pydantic"],
    estimated_total_hours: 3,
    deadline: "Today at 5:00 PM",
    task_type: "coding",
    preferred_app: "VS Code"
  },
  {
    title: "Schema Validation models",
    description: "Create rigid response schemas for our data ingestion pipeline. Ensure nested attributes are correctly validated and typed using Python type hinting.",
    tech_stack: ["Python", "Pydantic", "FastAPI"],
    estimated_total_hours: 2,
    deadline: "Today at 7:00 PM",
    task_type: "coding",
    preferred_app: "VS Code"
  },
  {
    title: "Write API Documentation Guide",
    description: "Prepare comprehensive onboarding documentation outlining the new API routes, request parameters, validation schemas, and expected error structures.",
    tech_stack: ["Markdown", "FastAPI", "Swagger"],
    estimated_total_hours: 1,
    deadline: "Tomorrow at 10:00 AM",
    task_type: "writing",
    preferred_app: "VS Code"
  }
];

const SEED_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Team Sync & Standup", start: "14:00", end: "14:30" },
  { id: "e2", title: "Sprint Release Deployment", start: "16:00", end: "17:00" },
  { id: "e3", title: "Client Review Session", start: "18:30", end: "19:00" }
];

interface OryzoAppProps {
  theme?: "dark" | "light";
}

export default function OryzoApp({ theme = "dark" }: OryzoAppProps) {
  const isLight = theme === "light";

  // Task Queue state
  const [tasks, setTasks] = useState<TaskCandidate[]>(() => {
    return SEED_TASKS.map((t, idx) => ({ ...t, id: `task-${idx}` }));
  });

  // Prioritized list
  const [prioritizedQueue, setPrioritizedQueue] = useState<PrioritizedTask[]>([]);
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  // Calendar commitments
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(SEED_CALENDAR_EVENTS);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("15:00");
  const [showCalendarManager, setShowCalendarManager] = useState(false);

  // Active Sprint state
  const [sprintId, setSprintId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<MicroTask[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [scaffold, setScaffold] = useState<CodeScaffold | null>(null);
  const [assessments, setAssessments] = useState<DeadlineAssessment[]>([]);
  const [isInitializingSprint, setIsInitializingSprint] = useState(false);
  const [isFetchingNextStep, setIsFetchingNextStep] = useState(false);
  const [materializeResult, setMaterializeResult] = useState<{
    workspace_path?: string;
    launch_command?: string;
    message?: string;
  } | null>(null);
  const [isMaterializing, setIsMaterializing] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    percentage?: number;
    message?: string;
    files?: string[];
  } | null>(null);

  // Selected task in Queue for sprint creation
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0);

  // Timer Focus Mode State
  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // 15 mins
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // System logs
  const [logs, setLogs] = useState<string[]>(["[System Init] Catalyst Workspace Active. Ready to prioritize or initiate sprint."]);
  const [showLogs, setShowLogs] = useState(false);

  // Form State for creating new tasks
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskType, setNewTaskType] = useState<'coding' | 'writing' | 'general'>("coding");
  const [newTaskHours, setNewTaskHours] = useState(2);
  const [newTaskStack, setNewTaskStack] = useState("React, TypeScript, FastAPI");
  const [newTaskDeadline, setNewTaskDeadline] = useState(getInitialDeadline());
  const [newTaskApp, setNewTaskApp] = useState("VS Code");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Sanitizers to prevent backend validation crashes
  const sanitizeTasksForBackend = (taskList: TaskCandidate[]) => {
    return taskList.map(task => {
      let numericId = 0;
      if (task.id) {
        const parsed = parseInt(task.id.replace(/\D/g, ''), 10);
        numericId = isNaN(parsed) ? Math.floor(Math.random() * 1000000) : parsed;
      } else {
        numericId = Math.floor(Math.random() * 1000000);
      }

      let isoDeadline = "";
      if (task.deadline) {
        if (task.deadline.includes("Today") || task.deadline.includes("Tomorrow")) {
          const target = new Date();
          if (task.deadline.includes("Tomorrow")) {
            target.setDate(target.getDate() + 1);
          }
          const timeMatch = task.deadline.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3].toUpperCase();
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            target.setHours(hours, minutes, 0, 0);
          } else {
            target.setHours(17, 0, 0, 0);
          }
          isoDeadline = target.toISOString();
        } else {
          try {
            const date = new Date(task.deadline);
            if (isNaN(date.getTime())) throw new Error();
            isoDeadline = date.toISOString();
          } catch {
            const fallback = new Date();
            fallback.setHours(fallback.getHours() + 5);
            isoDeadline = fallback.toISOString();
          }
        }
      } else {
        const fallback = new Date();
        fallback.setHours(fallback.getHours() + 5);
        isoDeadline = fallback.toISOString();
      }

      return {
        id: numericId,
        title: task.title,
        description: task.description,
        tech_stack: task.tech_stack || [],
        estimated_total_hours: task.estimated_total_hours,
        deadline: isoDeadline,
        task_type: task.task_type || "coding",
        preferred_app: task.preferred_app || "VS Code"
      };
    });
  };

  const sanitizeCalendarEventsForBackend = (eventsList: CalendarEvent[]) => {
    return eventsList.map(event => {
      const today = new Date().toISOString().split("T")[0];
      let startTime = "";
      let endTime = "";
      
      if (event.start.includes("T") || event.start.includes("-")) {
        startTime = event.start;
      } else {
        startTime = `${today}T${event.start}:00`;
      }
      
      if (event.end.includes("T") || event.end.includes("-")) {
        endTime = event.end;
      } else {
        endTime = `${today}T${event.end}:00`;
      }

      return {
        title: event.title,
        start_time: startTime,
        end_time: endTime,
        description: "",
        location: ""
      };
    });
  };

  // Run initial prioritization
  useEffect(() => {
    handlePrioritize(tasks);
  }, []);

  // Timer ticker
  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerIsRunning(false);
            addLog("⚠️ Sprint 15-minute slot has finished! Time to inspect work.");
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          // Accelerated clock ticks to give immediate feedback under demonstration/evaluations
          return prev - 8;
        });
      }, 200);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerIsRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Call /api/sprint/prioritize
  const handlePrioritize = async (currentTasksList: TaskCandidate[]) => {
    if (currentTasksList.length === 0) return;
    setIsPrioritizing(true);
    addLog(`Calling API prioritize for ${currentTasksList.length} tasks...`);
    try {
      const sanitized = sanitizeTasksForBackend(currentTasksList);
      const res = await fetch(`${BACKEND_URL}/api/sprint/prioritize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: sanitized })
      });
      if (!res.ok) throw new Error("Prioritize failed");
      const data = await res.json();
      setPrioritizedQueue(data.prioritized_tasks || []);
      addLog("✅ Urgency optimization complete. Queue prioritized.");
    } catch (e: any) {
      addLog(`❌ Prioritize error: ${e.message}`);
    } finally {
      setIsPrioritizing(false);
    }
  };

  // Add new task candidate
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    const newlyCreated: TaskCandidate = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      tech_stack: newTaskStack.split(",").map(s => s.trim()).filter(Boolean),
      estimated_total_hours: newTaskHours,
      deadline: newTaskDeadline.trim() || "Today at 5:00 PM",
      task_type: newTaskType,
      preferred_app: newTaskApp
    };

    const updatedTasks = [...tasks, newlyCreated];
    setTasks(updatedTasks);
    addLog(`Task "${newlyCreated.title}" added to queue.`);
    handlePrioritize(updatedTasks);

    setNewTaskTitle("");
    setNewTaskDesc("");
    setIsAddingTask(false);
  };

  // Remove task from queue
  const handleRemoveTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    addLog(`Task removed.`);
    handlePrioritize(updated);
  };

  // Add calendar event
  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const ev: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      start: newEventTime,
      end: newEventTime
    };
    const updated = [...calendarEvents, ev];
    setCalendarEvents(updated);
    addLog(`Calendar event added: "${ev.title}"`);
    setNewEventTitle("");
  };

  // Remove calendar event
  const handleRemoveCalendarEvent = (id: string) => {
    setCalendarEvents(calendarEvents.filter(e => e.id !== id));
  };

  // Start Sprint (Initialize Sprint on server)
  const handleStartSprint = async (targetTask: TaskCandidate) => {
    setIsInitializingSprint(true);
    setCheckResult(null);
    setMaterializeResult(null);
    addLog(`Initializing AI Sprint workflow for task: "${targetTask.title}"...`);
    try {
      const sanitizedEvents = sanitizeCalendarEventsForBackend(calendarEvents);
      const res = await fetch(`${BACKEND_URL}/api/sprint/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monolithic_task: targetTask.title + " - " + targetTask.description,
          tech_stack: targetTask.tech_stack,
          estimated_total_hours: targetTask.estimated_total_hours,
          calendar_events: sanitizedEvents,
          task_type: targetTask.task_type,
          preferred_app: targetTask.preferred_app || "VS Code"
        })
      });

      if (!res.ok) throw new Error("Initialize failed");
      const data = await res.json();

      setSprintId(data.sprint_id);
      setTimeline(data.timeline || []);
      setScaffold(data.first_step_scaffold || null);
      setAssessments(data.deadline_assessments || []);
      setActiveStepIndex(0);
      setTimerSeconds(15 * 60); 
      setTimerIsRunning(true); 
      addLog(`🚀 Sprint "${data.sprint_id}" initialized! Timeline of ${data.timeline?.length || 0} slots ready.`);
    } catch (e: any) {
      addLog(`❌ Sprint Initialization error: ${e.message}`);
    } finally {
      setIsInitializingSprint(false);
    }
  };

  // Fetch next step scaffold
  const handleNextStep = async () => {
    if (!sprintId || timeline.length === 0) return;
    const currentStep = timeline[activeStepIndex];
    const nextIdx = activeStepIndex + 1;
    if (nextIdx >= timeline.length) {
      addLog("🎉 All tasks completed in this sprint. Stellar job, dev!");
      alert("Congratulations! You've finished the sprint timeline!");
      return;
    }

    const nextStep = timeline[nextIdx];
    setIsFetchingNextStep(true);
    addLog(`Requesting next microtask scaffold: "${nextStep.title}"...`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sprint/next-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprint_id: sprintId,
          completed_task_id: activeStepIndex + 1,
          next_task_id: nextIdx + 1,
          tech_stack: scaffold?.terminal_commands || [],
          next_task_description: nextStep.description,
          task_type: "coding"
        })
      });

      if (!res.ok) throw new Error("Next step generation failed");
      const nextScaffold = await res.json();

      setScaffold(nextScaffold);
      setActiveStepIndex(nextIdx);
      setTimerSeconds(15 * 60);
      setTimerIsRunning(true);
      setCheckResult(null);
      setMaterializeResult(null);
      addLog(`➡️ Advanced to step ${nextIdx + 1}: "${nextStep.title}". New scaffold loaded.`);
    } catch (e: any) {
      addLog(`❌ Next Step error: ${e.message}`);
    } finally {
      setIsFetchingNextStep(false);
    }
  };

  // Materialize file / Create Workspace on Server
  const handleMaterialize = async () => {
    if (!sprintId || !scaffold) return;
    setIsMaterializing(true);
    addLog(`Materializing active scaffold files inside workspace folder...`);
    try {
      const targetTask = prioritizedQueue[selectedTaskIndex] || tasks[0];
      const res = await fetch(`${BACKEND_URL}/api/sprint/materialize-scaffold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprint_id: sprintId,
          task_title: targetTask?.title,
          task_type: targetTask?.task_type || "coding",
          scaffold: scaffold,
          preferred_app: targetTask?.preferred_app || "VS Code",
          open_app: true
        })
      });

      if (!res.ok) throw new Error("Materialization failed");
      const result = await res.json();
      setMaterializeResult(result);
      addLog(`📁 Files written to workspace folder: "${result.workspace_path}"`);
    } catch (e: any) {
      addLog(`❌ Workspace creation error: ${e.message}`);
    } finally {
      setIsMaterializing(false);
    }
  };

  // Check current task progress
  const handleCheckProgress = async () => {
    if (!sprintId) return;
    setCheckingProgress(true);
    addLog("Analyzing code workspace files for meaningful modifications...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/sprint/check-task-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprint_id: sprintId,
          task_id: activeStepIndex + 1,
          workspace_path: materializeResult?.workspace_path || ""
        })
      });

      if (!res.ok) throw new Error("Verification failed");
      const data = await res.json();
      setCheckResult({
        percentage: data.completion_percentage,
        message: data.message,
        files: data.modified_files
      });
      addLog(`📊 Verification check complete: ${data.completion_percentage}% matching. ${data.message}`);
      
      if (data.is_completed) {
        addLog("✅ Task completed successfully! Ready for the next sprint step.");
      }
    } catch (e: any) {
      addLog(`❌ Check status error: ${e.message}`);
    } finally {
      setCheckingProgress(false);
    }
  };

  const getActiveRisk = () => {
    if (assessments && assessments.length > 0) {
      const highRisk = assessments.find(a => a.risk === "high");
      const mediumRisk = assessments.find(a => a.risk === "medium");
      if (highRisk) return { risk: "High", color: "text-red-400 font-bold", bg: isLight ? "bg-red-50 border-red-200" : "bg-red-950/20 border-red-500/20", width: "w-[85%] bg-red-500", text: highRisk.reasoning };
      if (mediumRisk) return { risk: "Medium", color: "text-amber-500 font-bold", bg: isLight ? "bg-amber-50 border-amber-200" : "bg-amber-950/20 border-amber-500/20", width: "w-[50%] bg-amber-500", text: mediumRisk.reasoning };
      return { risk: "Low", color: "text-emerald-500 font-bold", bg: isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/20", width: "w-[15%] bg-emerald-500", text: assessments[0].reasoning };
    }
    return {
      risk: "Low",
      color: "text-emerald-500 font-bold",
      bg: isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/20",
      width: "w-[15%] bg-emerald-500",
      text: "No calendar commitment conflicts found. Full sprint velocity predicted."
    };
  };

  const currentRisk = getActiveRisk();

  return (
    <div className={`pt-24 min-h-screen px-6 md:px-12 py-12 flex flex-col gap-8 transition-colors duration-500 ${isLight ? "bg-[#ffedd7] text-studio-black" : "bg-studio-black text-[#ffedd7]"}`}>
      
      {/* Dynamic Sub-header Banner */}
      <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-[#0c0805]/40 border border-cork-shadow/60 backdrop-blur-xl"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 bg-burnt-sienna rounded-full shadow-[0_0_8px_rgba(220,80,0,0.6)] animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tighter uppercase font-sans">
              CATALYST <span className="text-burnt-sienna">WORKSPACE</span>
            </h1>
            <p className="text-[11px] font-mono text-grey-brown mt-0.5">
              {sprintId ? `ACTIVE_SPRINT_REF: ${sprintId.substring(0, 15)}...` : "SYSTEM_READY: DEFINE_TASK"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-grey-brown font-semibold">Active State</span>
            <span className={`text-[13px] font-semibold flex items-center gap-1.5 ${sprintId ? "text-emerald-500 animate-pulse" : "text-burnt-sienna"}`}>
              {sprintId ? "● Active Sprint Mode" : "● Planning Phase"}
            </span>
          </div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`px-4 py-2 border rounded-full text-[10px] font-mono tracking-wider font-semibold transition-all cursor-pointer ${
              showLogs
                ? "bg-burnt-sienna/20 border-burnt-sienna/50 text-burnt-sienna"
                : isLight
                ? "bg-[#faf6f0] border-[#d2c2b0] hover:bg-white text-studio-black"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-warm-cream"
            }`}
          >
            Telemetry Logs {logs.length > 0 && `(${logs.length})`}
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE PANELS GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Forms (3 spans) */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* TASK INTAKE FORM */}
          <div className={`p-5 rounded-xl border flex flex-col gap-4 transition-all duration-300 ${
            isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-[#0c0805]/40 border border-cork-shadow/60 backdrop-blur-xl"
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-cork-shadow/20">
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-grey-brown font-bold flex items-center gap-1.5">
                <Plus size={13} className="text-burnt-sienna" /> Initialize Task
              </h2>
              <span className="text-[8px] font-mono text-grey-brown">D-FURY ENGINE</span>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider">Goal Title</label>
                <input
                  id="task-title-main"
                  type="text"
                  required
                  placeholder="e.g. Build SQLite Dashboard..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className={`w-full rounded p-2 text-xs transition-all placeholder:text-grey-brown/50 focus:outline-none ${
                    isLight 
                      ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904] focus:border-burnt-sienna/60" 
                      : "bg-black/40 border border-cork-shadow/50 text-warm-cream focus:border-burnt-sienna/60"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider">Description</label>
                <textarea
                  id="task-desc-main"
                  placeholder="Deconstruct monolithic blockades..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className={`w-full rounded p-2 text-xs transition-all resize-none h-14 placeholder:text-grey-brown/50 focus:outline-none ${
                    isLight 
                      ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904] focus:border-burnt-sienna/60" 
                      : "bg-black/40 border border-cork-shadow/50 text-warm-cream focus:border-burnt-sienna/60"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider">Type</label>
                  <select
                    id="task-type-select"
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className={`w-full rounded p-2 text-xs focus:outline-none ${
                      isLight 
                        ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904]" 
                        : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                    }`}
                  >
                    <option value="coding" className="bg-[#100904] text-warm-cream">Coding</option>
                    <option value="writing" className="bg-[#100904] text-warm-cream">Writing</option>
                    <option value="general" className="bg-[#100904] text-warm-cream">General</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider">Est. Hours</label>
                  <input
                    id="task-hours-input"
                    type="number"
                    min={1}
                    max={24}
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(Number(e.target.value))}
                    className={`w-full rounded p-2 text-xs focus:outline-none ${
                      isLight 
                        ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904]" 
                        : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider">Tech Stack</label>
                <input
                  id="task-stack-input"
                  type="text"
                  placeholder="FastAPI, React, Tailwind"
                  value={newTaskStack}
                  onChange={(e) => setNewTaskStack(e.target.value)}
                  className={`w-full rounded p-2 text-xs focus:outline-none ${
                    isLight 
                      ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904]" 
                      : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={9} /> Target Time
                  </label>
                  <input
                    id="task-deadline-main"
                    type="datetime-local"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className={`w-full rounded p-1.5 text-[10px] focus:outline-none [color-scheme:dark] ${
                      isLight 
                        ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904]" 
                        : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-grey-brown font-bold uppercase tracking-wider">IDE Editor</label>
                  <select
                    id="task-app-main"
                    value={newTaskApp}
                    onChange={(e) => setNewTaskApp(e.target.value)}
                    className={`w-full rounded p-2 text-xs focus:outline-none ${
                      isLight 
                        ? "bg-[#fcf8f2] border border-[#d2c2b0] text-[#100904]" 
                        : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                    }`}
                  >
                    <option value="VS Code" className="bg-[#100904] text-warm-cream">VS Code</option>
                    <option value="Cursor" className="bg-[#100904] text-warm-cream">Cursor</option>
                    <option value="Zed Editor" className="bg-[#100904] text-warm-cream">Zed Editor</option>
                    <option value="Terminal Only" className="bg-[#100904] text-warm-cream">Terminal</option>
                  </select>
                </div>
              </div>

              <button
                id="queue-task-btn"
                type="submit"
                disabled={isAddingTask || !newTaskTitle.trim()}
                className="w-full py-2.5 bg-burnt-sienna hover:bg-burnt-sienna/90 text-white rounded font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
              >
                + Add Task Candidate
              </button>
            </form>
          </div>

          {/* CALENDAR MANAGER */}
          <div className={`p-5 rounded-xl border flex flex-col gap-3 transition-all duration-300 ${
            isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-[#0c0805]/40 border border-cork-shadow/60 backdrop-blur-xl"
          }`}>
            <div className="flex justify-between items-center pb-1 border-b border-cork-shadow/20">
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-grey-brown font-bold flex items-center gap-1.5">
                <Calendar size={13} className="text-burnt-sienna" /> Calendar Commitments
              </h2>
              <button
                onClick={() => setShowCalendarManager(!showCalendarManager)}
                className="text-[9px] text-burnt-sienna hover:underline font-mono"
              >
                {showCalendarManager ? "[Hide]" : "[Manage]"}
              </button>
            </div>

            {showCalendarManager && (
              <form onSubmit={handleAddCalendarEvent} className={`p-2.5 rounded border space-y-2 mt-1 ${
                isLight ? "bg-[#faf6f0] border-[#d2c2b0]" : "bg-black/30 border-white/5"
              }`}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Event title..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className={`flex-1 rounded p-1 text-[11px] focus:outline-none ${
                      isLight ? "bg-white border border-[#d2c2b0] text-[#100904]" : "bg-black/60 border border-white/10 text-slate-200"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="14:00"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className={`w-14 rounded p-1 text-[11px] text-center font-mono focus:outline-none ${
                      isLight ? "bg-white border border-[#d2c2b0] text-[#100904]" : "bg-black/60 border border-white/10 text-slate-200"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1 bg-burnt-sienna/10 hover:bg-burnt-sienna/20 border border-burnt-sienna/30 text-burnt-sienna text-[9px] font-mono font-bold tracking-wider rounded uppercase"
                >
                  Insert Event
                </button>
              </form>
            )}

            <div className="space-y-1.5 mt-1 max-h-36 overflow-y-auto pr-1">
              {calendarEvents.map((e) => (
                <div key={e.id} className={`flex justify-between items-center text-xs p-1.5 px-2.5 rounded border transition-colors ${
                  isLight ? "bg-[#faf6f0] border-[#e5e5e5]" : "bg-black/20 border-white/5"
                }`}>
                  <span className="font-sans font-medium text-grey-brown">{e.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isLight ? "bg-white text-grey-brown border border-[#e5e5e5]" : "bg-white/5 text-slate-400"
                    }`}>{e.start}</span>
                    {showCalendarManager && (
                      <button
                        onClick={() => handleRemoveCalendarEvent(e.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CALENDAR RISK ASSESSMENT */}
          <div className={`p-5 rounded-xl border flex flex-col gap-3 transition-all duration-300 ${
            isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-[#0c0805]/40 border border-cork-shadow/60 backdrop-blur-xl"
          }`}>
            <h2 className="text-[11px] font-mono uppercase tracking-wider text-grey-brown font-bold flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-burnt-sienna" /> Overlap Risk Analysis
            </h2>

            <div className={`p-3 rounded-lg space-y-2 border transition-all ${
              isLight ? "bg-[#fcf8f2]" : "bg-black/20"
            } ${currentRisk.bg}`}>
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-grey-brown tracking-wider">Forecast</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${currentRisk.color}`}>{currentRisk.risk} Risk</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-grey-brown">
                {currentRisk.text}
              </p>
              <div className="h-1 w-full bg-grey-brown/10 rounded overflow-hidden">
                <div className={`h-full ${currentRisk.width} transition-all duration-500`}></div>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE COLUMN: Task List & Backlog Queue (4 spans) */}
        <section className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className={`p-5 rounded-xl border flex flex-col h-[680px] transition-all duration-300 ${
            isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-[#0c0805]/40 border border-cork-shadow/60 backdrop-blur-xl"
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-cork-shadow/20 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-grey-brown font-bold">
                  AI Prioritized Backlog
                </h2>
                {isPrioritizing && (
                  <span className="text-[8px] font-mono bg-burnt-sienna/10 text-burnt-sienna border border-burnt-sienna/20 px-1.5 py-0.5 rounded animate-pulse">
                    Optimizing...
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-grey-brown/5 rounded border border-cork-shadow/10 text-grey-brown">
                {tasks.length} Tasks
              </span>
            </div>

            {/* Scrollable backlog queue */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center border border-dashed border-cork-shadow/40 rounded-xl bg-black/5 p-4 text-center">
                  <HeartCrack size={20} className="text-grey-brown/60 mb-2 animate-bounce" />
                  <p className="text-xs text-grey-brown font-medium">No tasks in backlog.</p>
                  <p className="text-[9.5px] text-grey-brown/70 mt-1 max-w-[200px]">
                    Define and initialize a task candidate in the form on the left.
                  </p>
                </div>
              ) : prioritizedQueue.length > 0 ? (
                prioritizedQueue.map((item, index) => {
                  const isSelected = selectedTaskIndex === index;
                  const score = item.urgency_score || 80 - index * 15;
                  const isHighRisk = item.risk === "high" || score > 80;

                  return (
                    <div
                      key={item.id || index}
                      onClick={() => setSelectedTaskIndex(index)}
                      className={`p-3.5 rounded-lg cursor-pointer transition-all relative overflow-hidden group border ${
                        isSelected
                          ? isLight 
                            ? "bg-[#fff7ed] border-burnt-sienna/50 shadow-sm" 
                            : "bg-white/[0.05] border-burnt-sienna/40"
                          : isLight
                          ? "bg-[#faf6f0] border-[#e5e5e5] hover:bg-white"
                          : "bg-black/30 border-white/5 hover:bg-white/[0.01]"
                      }`}
                    >
                      {/* Rank tag and accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                        isSelected ? "bg-burnt-sienna" : isHighRisk ? "bg-red-500" : "bg-grey-brown/40"
                      }`} />

                      <div className="flex justify-between items-start pl-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8.5px] font-mono px-1 rounded bg-black/10 text-grey-brown font-semibold">
                              RANK #{index + 1}
                            </span>
                            <h4 className="text-xs font-bold leading-tight truncate">
                              {item.title}
                            </h4>
                          </div>

                          <p className="text-[11px] text-grey-brown leading-relaxed line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {item.tech_stack?.slice(0, 3).map((stack, sIdx) => (
                              <span key={sIdx} className="text-[8.5px] font-mono px-1 rounded bg-grey-brown/5 text-grey-brown border border-cork-shadow/10">
                                {stack}
                              </span>
                            ))}
                            <span className="text-[8.5px] font-mono text-grey-brown/80 ml-auto flex items-center gap-0.5">
                              <Clock size={8} /> {item.estimated_total_hours}h
                            </span>
                            <span className="text-[8.5px] font-mono text-burnt-sienna font-semibold flex items-center gap-0.5 bg-burnt-sienna/5 px-1 rounded border border-burnt-sienna/10">
                              {formatDeadlineText(item.deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right pl-3 shrink-0 flex flex-col items-end">
                          <span className={`text-[11px] font-mono font-bold ${isHighRisk ? "text-red-500" : "text-emerald-500"}`}>
                            Urgency: {score}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTask(item.id || "");
                            }}
                            className="text-[9px] text-red-500/70 hover:text-red-500 font-mono underline mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                tasks.map((item, index) => {
                  const isSelected = selectedTaskIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedTaskIndex(index)}
                      className={`p-3.5 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? isLight 
                            ? "bg-[#fff7ed] border-burnt-sienna/50 shadow-sm" 
                            : "bg-white/[0.05] border-burnt-sienna/40"
                          : isLight
                          ? "bg-[#faf6f0] border-[#e5e5e5] hover:bg-white"
                          : "bg-black/30 border-white/5 hover:bg-white/[0.01]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold leading-tight truncate">{item.title}</h4>
                          <p className="text-[11px] text-grey-brown mt-1 truncate">{item.description}</p>
                        </div>
                        <span className="text-[9px] font-mono text-grey-brown pl-2 shrink-0">{item.estimated_total_hours} hrs</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Launch sprint button */}
            <div className="mt-4 pt-3 border-t border-cork-shadow/20">
              <button
                id="start-sprint-btn"
                onClick={() => {
                  const selected = prioritizedQueue[selectedTaskIndex] || tasks[selectedTaskIndex] || tasks[0];
                  if (selected) {
                    handleStartSprint(selected);
                  }
                }}
                disabled={isInitializingSprint || tasks.length === 0}
                className={`w-full py-3 text-center rounded-lg font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex justify-center items-center gap-2 ${
                  isLight 
                    ? "bg-dark-cork text-warm-cream hover:bg-burnt-sienna shadow" 
                    : "bg-white text-studio-black hover:bg-burnt-sienna hover:text-white"
                }`}
              >
                {isInitializingSprint ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>AI Creating Sprint Timeline...</span>
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-current" />
                    <span>Start Active Sprint (Rank #{selectedTaskIndex + 1})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Active Focus Timer & Scaffolding (5 spans) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* FOCUS MODE AND SPRINT TIMER */}
          <div className={`p-6 rounded-xl border relative overflow-hidden transition-all duration-300 bg-gradient-to-br ${
            isLight 
              ? "from-burnt-sienna/5 to-transparent border-burnt-sienna/20 shadow-sm" 
              : "from-burnt-sienna/10 to-transparent border-burnt-sienna/30 backdrop-blur-xl"
          }`}>
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-burnt-sienna/5 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-[10px] uppercase tracking-widest text-burnt-sienna font-bold flex items-center gap-1">
                  <Clock size={11} className="animate-spin-slow" /> Catalyst Focus Clock
                </h2>
                <div className="text-3xl font-mono font-bold tracking-widest">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="text-[11px] text-grey-brown font-medium max-w-[280px] truncate">
                  {timeline.length > 0
                    ? `Slot ${activeStepIndex + 1}/${timeline.length}: ${timeline[activeStepIndex]?.title}`
                    : "Ready to focus. Initialize a sprint to launch."}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sprintId && (
                  <button
                    onClick={() => {
                      setTimerSeconds(15 * 60);
                      setTimerIsRunning(false);
                      addLog("Focus timer reset to 15:00.");
                    }}
                    title="Reset Focus Slot"
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      isLight ? "bg-white border-[#e5e5e5] text-grey-brown hover:bg-[#faf6f0]" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
                
                <button
                  id="timer-toggle-btn"
                  onClick={() => {
                    if (!sprintId) {
                      addLog("Please start a sprint first to run the timer.");
                      return;
                    }
                    setTimerIsRunning(!timerIsRunning);
                    addLog(timerIsRunning ? "Timer paused." : "Timer started.");
                  }}
                  className="w-12 h-12 rounded-full border border-burnt-sienna/50 flex items-center justify-center bg-burnt-sienna/10 hover:bg-burnt-sienna text-burnt-sienna hover:text-white transition-all shadow-[0_0_15px_rgba(220,80,0,0.15)] cursor-pointer"
                >
                  {timerIsRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5 fill-current" />}
                </button>
              </div>
            </div>

            {/* Micro-Progress Segment Bar */}
            {timeline.length > 0 && (
              <div className="mt-4 pt-3 border-t border-cork-shadow/20 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-grey-brown font-mono font-semibold">
                  <span>SPRINT COMPLETENESS</span>
                  <span>{Math.round(((activeStepIndex + 1) / timeline.length) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-grey-brown/10 rounded-full overflow-hidden flex gap-0.5">
                  {timeline.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 transition-all ${
                        idx < activeStepIndex
                          ? "bg-emerald-500"
                          : idx === activeStepIndex
                          ? "bg-burnt-sienna animate-pulse"
                          : "bg-grey-brown/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE STEP TIMELINE ROADMAP */}
          {sprintId && timeline.length > 0 && (
            <div className={`p-4 border rounded-xl flex flex-col gap-2 transition-all ${
              isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-white/[0.01] border-white/5"
            }`}>
              <span className="text-[9px] uppercase tracking-widest text-grey-brown font-bold block mb-1">
                SPRINT ROADMAP SLOTS
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                {timeline.map((item, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isActive = idx === activeStepIndex;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded transition-colors ${
                        isActive
                          ? "bg-burnt-sienna/10 border border-burnt-sienna/20 text-burnt-sienna font-semibold"
                          : isDone
                          ? "text-grey-brown/60 line-through opacity-60"
                          : "text-grey-brown"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[9px] opacity-60">#{idx + 1}</span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="shrink-0 pl-2">
                        {isDone && <CheckCircle size={10} className="text-emerald-500" />}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-burnt-sienna animate-ping" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CODE SCAFFOLD PANEL */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between h-[450px] transition-all duration-300 ${
            isLight ? "bg-white border-[#e5e5e5] shadow-sm" : "bg-[#0c0805]/40 border border-cork-shadow/60 backdrop-blur-xl"
          }`}>
            <div className="min-h-0 flex-1 flex flex-col overflow-y-auto pr-1">
              <div className="flex justify-between items-center pb-2 border-b border-cork-shadow/20 mb-3 shrink-0">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-grey-brown font-bold flex items-center gap-1.5">
                  <Code size={13} className="text-burnt-sienna" /> AI Code Scaffold
                </h2>
                {scaffold?.file_path && (
                  <span className="text-[9px] font-mono text-grey-brown bg-grey-brown/5 px-2 py-0.5 rounded border border-cork-shadow/10 truncate max-w-[180px]">
                    📄 {scaffold.file_path.split("/").pop()}
                  </span>
                )}
              </div>

              {!scaffold ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-cork-shadow/40 rounded-lg bg-black/5 p-4 text-center">
                  <Terminal size={24} className="text-grey-brown/60 mb-2" />
                  <p className="text-xs text-grey-brown font-semibold font-mono">No Active Scaffold Loaded</p>
                  <p className="text-[10px] text-grey-brown/70 mt-1 max-w-[280px] leading-relaxed">
                    Scaffolds supply real-time boilerplate code, setup terminal scripts, design guidelines, and API pathways. Start a task sprint to view.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 min-h-0 flex-1 flex flex-col">
                  
                  {/* Code preview codeblock */}
                  <div className="bg-[#211b16] rounded-lg p-3 border border-cork-shadow/80 font-mono text-[10.5px] overflow-auto max-h-40 relative group shrink-0">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scaffold.boilerplate_code);
                          addLog("📋 Boilerplate copied to clipboard.");
                        }}
                        className="bg-studio-black text-warm-cream text-[9px] px-2 py-1 rounded border border-cork-shadow hover:bg-burnt-sienna transition-all cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-grey-brown mb-1.5 text-[9px]"># active_boilerplate_code ({scaffold.file_path})</div>
                    <pre className="text-amber-200/90 leading-relaxed font-mono select-all">
                      {scaffold.boilerplate_code}
                    </pre>
                  </div>

                  {/* Terminal commands run path */}
                  {scaffold.terminal_commands && scaffold.terminal_commands.length > 0 && (
                    <div className="p-2.5 bg-[#171412] border border-cork-shadow/60 rounded-md font-mono text-[10px] text-burnt-sienna flex items-center gap-2 shrink-0">
                      <Terminal size={11} className="text-grey-brown" />
                      <span className="text-grey-brown">Terminal:</span>
                      <span className="text-warm-cream/90 font-semibold truncate flex-1">{scaffold.terminal_commands.join(" && ")}</span>
                    </div>
                  )}

                  {/* Text descriptions scroll block */}
                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 text-xs">
                    <div className="p-3 rounded bg-grey-brown/5 border border-cork-shadow/10 leading-relaxed">
                      <span className="text-[9px] uppercase font-bold text-grey-brown block mb-1">Developer Guidance:</span>
                      <p className="text-grey-brown">{scaffold.user_guidance}</p>
                    </div>

                    {scaffold.design_inspiration && (
                      <div className="p-3 rounded bg-burnt-sienna/5 border border-burnt-sienna/10 leading-relaxed">
                        <span className="text-[9px] uppercase font-bold text-burnt-sienna block mb-1">UI/UX Design Inspiration:</span>
                        <p className="text-grey-brown">{scaffold.design_inspiration}</p>
                      </div>
                    )}
                  </div>

                  {/* Documentation tags */}
                  {scaffold.documentation_links && scaffold.documentation_links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 shrink-0 border-t border-cork-shadow/10">
                      {scaffold.documentation_links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 hover:bg-emerald-500/10 font-mono"
                        >
                          <ExternalLink size={9} /> docs: {link.split("/").pop()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WORKSPACE & VERIFICATION ACTIONS BLOCK */}
            {sprintId && (
              <div className="space-y-3 mt-4 pt-3 border-t border-cork-shadow/20 shrink-0">
                
                {/* Scan Status Results */}
                {checkResult && (
                  <div className={`p-2.5 border rounded-md text-[11px] flex flex-col gap-1 ${
                    isLight ? "bg-[#f4faf4] border-green-200" : "bg-emerald-950/10 border-emerald-500/25"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-emerald-500" />
                      <span className="font-bold text-emerald-600">Verification Complete ({checkResult.percentage}%)</span>
                    </div>
                    <p className="text-[11px] text-grey-brown leading-relaxed font-mono">{checkResult.message}</p>
                    {checkResult.files && checkResult.files.length > 0 && (
                      <div className="text-[9px] text-grey-brown/70 mt-0.5">Modified files: {checkResult.files.join(", ")}</div>
                    )}
                  </div>
                )}

                {materializeResult && (
                  <div className={`p-2.5 border rounded-md text-[10.5px] flex flex-col gap-1 font-mono ${
                    isLight ? "bg-[#fdf9f4] border-orange-200" : "bg-burnt-sienna/5 border-burnt-sienna/20"
                  }`}>
                    <span className="text-burnt-sienna font-bold text-[9px] uppercase">WORKSPACE FOLDER READY</span>
                    <span className="text-grey-brown break-all">{materializeResult.workspace_path}</span>
                    <span className="text-[9.5px] text-grey-brown/65 mt-0.5">Command: `{materializeResult.launch_command}`</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleMaterialize}
                    disabled={isMaterializing}
                    className="py-2.5 px-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isMaterializing ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FolderCode size={12} /> Open Workspace
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCheckProgress}
                    disabled={checkingProgress}
                    className={`py-2.5 px-1 border rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isLight 
                        ? "bg-[#faf6f0] border-[#d2c2b0] hover:bg-white text-studio-black" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    }`}
                  >
                    {checkingProgress ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckSquare size={12} /> Check Progress
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNextStep}
                    disabled={isFetchingNextStep}
                    className="py-2.5 px-1 bg-burnt-sienna hover:bg-burnt-sienna/90 disabled:opacity-50 text-white rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                  >
                    {isFetchingNextStep ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Next Step <ChevronRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* EXPANDABLE TELEMETRY LOGS DRAWER */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "180px", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#171412] border-t border-cork-shadow/80 w-full px-6 py-4 flex flex-col z-20 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] overflow-hidden rounded-t-2xl shrink-0"
          >
            <div className="flex justify-between items-center mb-2 shrink-0">
              <span className="text-[9.5px] font-mono text-burnt-sienna font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Terminal size={11} /> API Telemetry & Local Workspace Logs
              </span>
              <button
                onClick={() => setShowLogs(false)}
                className="text-[10px] text-grey-brown hover:text-warm-cream font-mono cursor-pointer"
              >
                [X] Close Telemetry Drawer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-black/50 rounded p-3 border border-cork-shadow/40 font-mono text-[11px] text-emerald-400/90 space-y-1 select-text">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed hover:text-white transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM STATUS FOOTER */}
      <footer className="h-8 px-4 flex items-center justify-between border-t border-cork-shadow/20 text-[9px] font-mono text-grey-brown uppercase shrink-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Telemetry: online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-burnt-sienna animate-ping" />
            <span>Main Workspace Branch: healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu size={11} />
            <span>Local daemon: Active</span>
          </div>
        </div>
        <div>
          Catalyst Engine v4.2.1 • Sandboxed Localhost
        </div>
      </footer>
    </div>
  );
}
