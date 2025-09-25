"use client"

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { ViewHolder } from "@/components/ui/ViewHolder";
import { Today } from "@/pages/Today";
import { Inbox } from "@/pages/Inbox";
import { Upcoming } from "@/pages/Upcoming";
// import { Projects } from "@/pages/Projects";
import { ProjectTasks } from "@/pages/ProjectTasks";
import { ComprehensiveCalendar } from "@/pages/ComprehensiveCalendar";
import { SearchIcon, Calendar1Icon, CirclePlusIcon, FolderOutputIcon, CalendarClockIcon, EllipsisIcon, FolderIcon, CircleCheckIcon } from "lucide-react"
import { SidebarItem, ProjectItem } from "@/types"
import Completed from "@/pages/Completed";
import { projectApi } from "@/lib/api/project";
import { taskApi } from "@/lib/api/task";
import { TaskProvider, useTaskCounts } from "@/contexts/TaskContext";
import { useTaskEvents } from "@/hooks/useTaskEvents";
// front end only - MOCK DATA COMMENTED OUT
const navigationMainFeatures: SidebarItem[] = [
  { id: "calendar", label: "Calendar", icon: CircleCheckIcon, view: ComprehensiveCalendar, isView: true},
  { id: "inbox", label: "Inbox", icon: FolderOutputIcon, view: Inbox, isView: true},
  { id: "today", label: "Today", icon: Calendar1Icon, view: Today, isView: true},
  { id: "upcoming", label: "Upcoming", icon: CalendarClockIcon, view: Upcoming, isView: true},
  { id: "completed", label: "Completed", icon: CircleCheckIcon, view: Completed, isView: true},
  { id: "more", label: "More", icon: EllipsisIcon, view: null, isView: false}
];


// Inner App component that uses TaskContext
function AppContent() {
  const [activeId, setActiveId] = useState("empty");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentProjects, setCurrentProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Use TaskContext for real-time task counts
  const { taskCounts } = useTaskCounts();

  // Listen to task events for real-time updates
  useTaskEvents();

  // Dynamic project ID mapping - will be populated from API
  const [projectIdMapping, setProjectIdMapping] = useState<{[key: string]: string}>({});

  // Load projects from API
  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const projects = await projectApi.getAllProjects();

      // Update projects with their task counts from TaskContext
      const projectsWithCounts = projects.map(project => ({
        ...project,
        taskCount: taskCounts?.projects[project.id] || 0
      }));

      setCurrentProjects(projectsWithCounts);

      // Build dynamic project ID mapping
      const newMapping: {[key: string]: string} = {};
      projectsWithCounts.forEach(project => {
        newMapping[project.id] = project.id;
      });
      setProjectIdMapping(newMapping);

      console.log("Projects loaded:", projectsWithCounts);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Load projects from API on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Reload projects when task counts change (to update project task counts)
  useEffect(() => {
    if (taskCounts && currentProjects.length > 0) {
      const updatedProjects = currentProjects.map(project => ({
        ...project,
        taskCount: taskCounts.projects[project.id] || 0
      }));
      setCurrentProjects(updatedProjects);
    }
  }, [taskCounts]);

  // Handle project updates (rename/delete)
  const handleProjectUpdate = async () => {
    await loadProjects();
  };

  const handleChange = (id: string) => {
    // Check if this is a project ID
    if (projectIdMapping[id]) {
      // This is a project, show ProjectTasks
      setSelectedProjectId(projectIdMapping[id]);
      setActiveId("project-view");
    } else {
      // This is a regular navigation item
      setActiveId(id);
      setSelectedProjectId(null);
    }
  }

  const handleBackToProjects = () => {
    // Navigate back to inbox or previous view
    // setActiveId("inbox");
    setSelectedProjectId(null);
  }

  const handleProjectsChange = (newProjects: ProjectItem[]) => {
    setCurrentProjects(newProjects);

    // Update project ID mapping for new projects
    newProjects.forEach(project => {
      projectIdMapping[project.id] = project.id;
    });
  }

  // Get the active component
  let ActiveComponent: React.ComponentType<{}>;

  if (activeId === "project-view" && selectedProjectId) {
    // Show ProjectTasks when a project is selected
    ActiveComponent = () => (
      <ProjectTasks
        projectId={selectedProjectId}
        onBackToProjects={handleBackToProjects}
        onProjectUpdate={handleProjectUpdate}
      />
    );
  } else {
    // Show regular pages
    const activeItem = navigationMainFeatures.find(i => i.id === activeId);
    ActiveComponent = activeItem?.view || (() => (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Your Task Manager</h2>
          <p className="text-gray-600">Get started by adding your first task or project.</p>
        </div>
      </div>
    ));
  }

  // Create navigation items with counts from TaskContext
  const navigationWithCounts = navigationMainFeatures.map(item => ({
    ...item,
    count: taskCounts?.[item.id as keyof typeof taskCounts] as number
  }));

  return (
    <div className="flex">
      <Sidebar navigationItems={navigationWithCounts} onChange={handleChange} projectItems={currentProjects} onProjectsChange={handleProjectsChange} />
      <ViewHolder Component={ActiveComponent} />
    </div>
  );
}

// Main App component with TaskProvider wrapper
export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}