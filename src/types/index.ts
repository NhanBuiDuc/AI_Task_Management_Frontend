// Global interface definitions
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  view: React.ComponentType | null;
  isView: boolean;
  count?: number;
}

export interface ProjectItem{
  id: string;
  name: string;
  parent_id: string | null;
  taskCount: number;
  hasChildren: boolean;
  icon: string;
  color: string;
}

export interface TaskItem{
  id: string;
  name:string;
  description: string | null;
  project_id: string | null;
  section_id: string | null;
  due_date: string ;
  completed: boolean;
  totally_completed: boolean;
  current_view: View[]; // where it is now, can be both on project and other views.
  piority: Piority;
  reminder_date?: string; // Optional reminder date with time
  completed_date: string;
}

export interface SectionItem{
  id: string;
  name: string;
  project_id: string;
  current_view: View[]; // where it is now, can be both on project and other views.
}


export type ButtonSize = "default" | "sm" | "lg" | "xl";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";


export type View = "calendar" | "inbox" | "today" | "upcoming" | "project" | "overdue";

export type Piority = "low" | "medium" | "high" | "urgent" | "emergency"