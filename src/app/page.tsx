"use client"

import React, { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { ViewHolder } from "@/components/ui/ViewHolder";
import { Home } from "@/pages/Home";
import { Today } from "@/pages/Today";
import { Inbox } from "@/pages/Inbox";
import { Contact } from "@/pages/Contact";
import { Upcoming } from "@/pages/Upcoming";
// import { Projects } from "@/pages/Projects";
import { ProjectTasks } from "@/pages/ProjectTasks";
import { ComprehensiveCalendar } from "@/pages/ComprehensiveCalendar";
import { SearchIcon, Calendar1Icon, CirclePlusIcon, FolderOutputIcon, CalendarClockIcon, EllipsisIcon, FolderIcon } from "lucide-react"

import {AvatarDropdown} from "@/components/ui/avartar_dropdown";
import { SidebarItem } from "@/types";

const navigationMainFeatures = [
  { id: "add-task", label: "Add task", icon: CirclePlusIcon, view: null, isView: false},
  { id: "search", label: "Search", icon: SearchIcon, view: null, isView: false},
  { id: "inbox", label: "Inbox", icon: FolderOutputIcon, view: Inbox, isView: true},
  { id: "today", label: "Today", icon: Calendar1Icon, view: Today, isView: true},
  { id: "upcoming", label: "Upcoming", icon: CalendarClockIcon, view: Upcoming, isView: true},
  { id: "calendar", label: "Calendar", icon: CalendarClockIcon, view: ComprehensiveCalendar, isView: true},
  { id: "projects", label: "Projects", icon: FolderIcon, view: ProjectTasks, isView: true},
  { id: "more", label: "More", icon: EllipsisIcon, view: null, isView: false}
];


// Map sidebar project IDs to numeric project IDs
const projectIdMapping = {
  "4": 4,   // Getting Started
  "8": 8,   // Frontend Basics (sub)
  "9": 9,   // Backend Basics (sub)
  "5": 5,   // Mobile Development
  "11": 11, // Task Manager App
  "6": 6,   // Personal Learning
  "7": 7    // Home Improvement
};

export default function App() {
  const [activeId, setActiveId] = useState("inbox");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

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
    setActiveId("inbox");
    setSelectedProjectId(null);
  }

  // Get the active component
  let ActiveComponent;

  if (activeId === "project-view" && selectedProjectId) {
    // Show ProjectTasks when a project is selected
    ActiveComponent = () => (
      <ProjectTasks
        projectId={selectedProjectId}
        onBackToProjects={handleBackToProjects}
      />
    );
  } else {
    // Show regular pages
    const activeItem = navigationMainFeatures.find(i => i.id === activeId);
    ActiveComponent = activeItem?.view || Inbox;
  }

  return (
    <div className="flex">
      <Sidebar items={navigationMainFeatures} onChange={handleChange} />
      <ViewHolder Component={ActiveComponent} />
    </div>
  )
}