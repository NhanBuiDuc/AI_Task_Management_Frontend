// src\components\ui\Sidebar.tsx
// src\components\ui\Sidebar.tsx
import React, { useState } from "react";
import { AvatarDropdown } from "@/components/ui/avartar_dropdown";
import { IconTextButton } from "./icon_text_button";
import { SidebarItem } from "@/types";
import { ChevronDown, ChevronRight, Hash, Plus, Bell, PanelLeftClose, PanelLeftOpen, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/ui/task_form";
import ProjectForm from "@/components/ui/project_form";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  items: SidebarItem[];
  onChange: (id: string) => void;
}

export function Sidebar({items, onChange}: SidebarProps){
  const [showProjects, setShowProjects] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Project data structure that matches ProjectTasks numeric IDs
  const projects = [
    { 
      id: 4, 
      name: "Getting Started", 
      label: "Getting Started 💡", 
      parent_id: null, 
      taskCount: 8,
      hasChildren: true 
    },
    { 
      id: 8, 
      name: "Frontend Basics", 
      label: "sub", 
      parent_id: 4, 
      taskCount: 1,
      hasChildren: false 
    },
    { 
      id: 5, 
      name: "Mobile Development", 
      label: "Notes and Reference Materials", 
      parent_id: null, 
      taskCount: 2,
      hasChildren: false 
    },
    { 
      id: 11, 
      name: "Task Manager App", 
      label: "board", 
      parent_id: null, 
      taskCount: 1,
      hasChildren: false 
    }
  ];

  // Get parent projects
  const parentProjects = projects.filter(project => project.parent_id === null);
  
  // Get sub projects for a parent
  const getSubProjects = (parentId: number) => {
    return projects.filter(project => project.parent_id === parentId);
  };

  const handleAddTask = (newTask: any) => {
    console.log("New task created:", newTask);
    setShowTaskForm(false);
  };

  const handleCancelForm = () => {
    setShowTaskForm(false);
  };

  const handleAddProject = (newProject: any) => {
    console.log("New project created:", newProject);
    setShowProjectForm(false);
  };

  const handleCancelProjectForm = () => {
    setShowProjectForm(false);
  };

  const sidebarWidth = isExpanded ? "w-72" : "w-16";

  return(
    <div className={`${sidebarWidth} bg-gray-50 h-screen transition-all duration-300 flex flex-col border-r border-gray-200`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isExpanded && <AvatarDropdown/>}
          <div className="flex items-center gap-2">
            {isExpanded && (
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                <Bell className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? (
                <PanelLeftClose className="h-4 w-4 text-gray-500" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-1">
        {/* Add Task Button */}
        <IconTextButton
          onClick={() => setShowTaskForm(true)}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          variant="ghost"
          size="default"
          icon={<Plus size={18} />}
          label={isExpanded ? "Add task" : ""}
        />

        {/* Calendar Button */}
        <IconTextButton
          onClick={() => onChange("calendar")}
          className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          variant="ghost"
          size="default"
          icon={<Calendar size={18} />}
          label={isExpanded ? "Calendar" : ""}
        />

        {/* Main Navigation Items */}
        <div className="space-y-1 mt-4">
          {items.map((item: SidebarItem) => {
            const Icon = item.icon;

            // Skip the projects and add-task items from main features
            if (item.id === "projects" || item.id === "add-task") return null;

            return (
              <IconTextButton
                key={item.id}
                onClick={() => onChange(item.id)}
                className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                variant="ghost"
                size="default"
                icon={Icon ? <Icon size={18} /> : undefined }
                label={isExpanded ? item.label : ""}
                endTextLabel={isExpanded ? (item.id === "inbox" ? "3" : item.id === "today" ? "1" : "") : ""}
                labelClassName=""
                endTextLabelClassName="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded"
              />
            );
          })}
        </div>

        {/* My Projects Section */}
        {isExpanded && (
          <div className="mt-6">
            <div className="flex items-center gap-1">
              <IconTextButton
                onClick={() => setShowProjects(!showProjects)}
                className="flex-1 justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                variant="ghost"
                size="default"
                icon={showProjects ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                label="My Projects"
                endTextLabel="USED: 4/5"
                endTextLabelClassName="text-xs text-gray-500"
              />
              <Button
                onClick={() => setShowProjectForm(true)}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              >
                <Plus size={14} />
              </Button>
            </div>

            {showProjects && (
              <div className="ml-4 mt-1 space-y-1">
                {parentProjects.map((project) => {
                  const subProjects = getSubProjects(project.id);
                  
                  if (project.id === 4) { // Getting Started project
                    return (
                      <div key={project.id}>
                        {/* Getting Started with separate click areas */}
                        <div className="flex items-center group hover:bg-gray-100 rounded">
                          {/* Main project button - clickable for navigation */}
                          <button
                            onClick={() => onChange(project.id.toString())} // Navigate to ProjectTasks
                            className="flex items-center gap-2 px-2 py-1.5 flex-1 text-left rounded-l text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Hash size={16} />
                            <span>{project.label}</span>
                          </button>

                          {/* Dropdown toggle button - separate click area */}
                          <button
                            onClick={() => setShowGettingStarted(!showGettingStarted)} // Toggle dropdown
                            className="p-1.5 hover:bg-gray-200 rounded-r text-gray-500 hover:text-gray-700"
                          >
                            {showGettingStarted ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>

                          {/* Task count */}
                          <div className="px-2 text-xs text-orange-500 font-medium">
                            {project.taskCount}
                          </div>
                        </div>

                        {/* Sub projects */}
                        {showGettingStarted && (
                          <div className="ml-6">
                            {subProjects.map((subProject) => (
                              <IconTextButton
                                key={subProject.id}
                                onClick={() => onChange(subProject.id.toString())}
                                className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                variant="ghost"
                                size="sm"
                                icon={<Hash size={16} />}
                                label={subProject.label}
                                endTextLabel={subProject.taskCount > 0 ? subProject.taskCount.toString() : undefined}
                                endTextLabelClassName="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Regular projects without sub-projects
                  return (
                    <IconTextButton
                      key={project.id}
                      onClick={() => onChange(project.id.toString())}
                      className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      variant="ghost"
                      size="default"
                      icon={<Hash size={16} />}
                      label={project.label}
                      endTextLabel={project.taskCount > 0 ? project.taskCount.toString() : undefined}
                      endTextLabelClassName="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded"
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Help & resources */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <IconTextButton
            onClick={() => onChange("help")}
            className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            variant="ghost"
            size="default"
            icon={<div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">?</div>}
            label="Help & resources"
          />
        </div>
      )}

      {/* Task Form Modal */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleAddTask} onCancel={handleCancelForm} />
        </DialogContent>
      </Dialog>

      {/* Project Form Modal */}
      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={handleAddProject} onCancel={handleCancelProjectForm} />
        </DialogContent>
      </Dialog>
    </div>
  )
}