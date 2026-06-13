import {
  LayoutDashboard,
  Bot,
  FolderGit2,
  BookOpen,
  ListChecks,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Projects", href: "/projects", icon: FolderGit2 },
  { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];
