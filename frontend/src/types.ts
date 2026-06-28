export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date-time
  end: string;   // ISO date-time
}

export interface MicroTask {
  id: string;
  title: string;
  duration_minutes: number;
  description: string;
}

export interface CodeScaffold {
  terminal_commands: string[];
  file_path: string;
  boilerplate_code: string;
  documentation_links: string[];
  user_guidance: string;
  design_inspiration: string;
  additional_files?: Array<{ path: string; content: string }>;
}

export interface TaskCandidate {
  id?: string;
  title: string;
  description: string;
  tech_stack: string[];
  estimated_total_hours: number;
  deadline: string; // ISO date-time or relative day
  task_type: 'coding' | 'writing' | 'general';
  preferred_app?: string;
}

export interface PrioritizedTask extends TaskCandidate {
  priority_rank: number;
  urgency_score: number; // 0 to 100
  risk: 'low' | 'medium' | 'high';
  recommended_start: string;
  reasoning: string;
}

export interface DeadlineAssessment {
  event_title: string;
  deadline: string;
  can_meet_deadline: boolean;
  risk: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface Sprint {
  id: string;
  monolithic_task: string;
  tech_stack: string[];
  estimated_total_hours: number;
  calendar_events: CalendarEvent[];
  task_type: 'coding' | 'writing' | 'general';
  timeline: MicroTask[];
  current_step_index: number;
  current_scaffold: CodeScaffold | null;
  assessments: DeadlineAssessment[];
  timer_duration_seconds: number;
  timer_remaining_seconds: number;
  timer_is_running: boolean;
  workspace_path?: string;
}
