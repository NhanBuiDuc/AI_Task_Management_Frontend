// Global interface definitions
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  view: React.ComponentType | null;
  isView: boolean;
}

export type ButtonSize = "default" | "sm" | "lg" | "xl";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";