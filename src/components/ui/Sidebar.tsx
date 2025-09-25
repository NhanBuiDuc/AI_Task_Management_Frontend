// src\components\ui\Sidebar.tsx
// src\components\ui\Sidebar.tsx
import React, { useState } from "react";
import { AvatarDropdown } from "@/components/ui/avartar_dropdown";
import { IconTextButton } from "./icon_text_button";
import { SidebarItem, ProjectItem } from "@/types";
import { ChevronDown, ChevronRight, Hash, Plus, Bell, PanelLeftClose, PanelLeftOpen, Calendar } from "lucide-react";
import { getProjectIcon } from '@/lib/iconMapping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/ui/task_form";
import ProjectForm from "@/components/ui/project_form";
import { Button } from "@/components/ui/button";
import { ComprehensiveCalendar } from "@/pages/ComprehensiveCalendar";
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';
interface SidebarProps {
  navigationItems: SidebarItem[];
  projectItems: ProjectItem[];
  onChange: (id: string) => void;
  onProjectsChange: (projects: ProjectItem[]) => void;
}

export function Sidebar({navigationItems: items, projectItems: projects, onChange, onProjectsChange}: SidebarProps){
  const [showProjects, setShowProjects] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Get parent projects
  const parentProjects = projects.filter(project => project.parent_id === null);
  
  // Get sub projects for a parent
  const getSubProjects = (parentId: string) => {
    return projects.filter(project => project.parent_id === parentId);
  };

  const handleAddTask = async (newTask: any) => {
    try {
      console.log("Creating new task:", newTask);

      // Use enhanced API that will emit events and trigger real-time updates
      const createdTask = await enhancedTaskApi.createTask(newTask);

      console.log("Task created successfully:", createdTask);
      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancelForm = () => {
    setShowTaskForm(false);
  };

  const handleAddProject = (newProject: ProjectItem) => {
    console.log("New project created:", newProject);
    // Add the new project to the existing projects list
    const updatedProjects = [...projects, newProject];
    onProjectsChange(updatedProjects);
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

        {/* Main Navigation Items */}
        <div className="space-y-1 mt-4">
          {items.map((item: SidebarItem) => {
            const Icon = item.icon;

            // // Skip the projects and add-task items from main features
            // if (item.id === "projects" || item.id === "add-task") return null;
            if (item.id === "calendar"){
              return (
              <IconTextButton
                key={item.id}
                onClick={() => onChange(item.id)}
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                variant="ghost"
                size="default"
                icon={<Calendar size={18} />}
                label={isExpanded ? "Calendar" : ""}
                endTextLabel={isExpanded && item.count !== undefined ? item.count.toString() : ""}
                labelClassName=""
                endTextLabelClassName="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded"
              />
            );
            }
            return (
              <IconTextButton
                key={item.id}
                onClick={() => onChange(item.id)}
                className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                variant="ghost"
                size="default"
                icon={Icon ? <Icon size={18} /> : undefined }
                label={isExpanded ? item.label : ""}
                endTextLabel={isExpanded && item.count !== undefined ? item.count.toString() : ""}
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
                endTextLabel={projects.length > 0 ? projects.length.toString() + " projects" : ""}
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
                  
                  if (project.hasChildren) { // Getting Started project
                    return (
                      <div key={project.id}>
                        {/* Getting Started with separate click areas */}
                        <div className="flex items-center group hover:bg-gray-100 rounded">
                          {/* Main project button - clickable for navigation */}
                          <button
                            onClick={() => onChange(project.id.toString())} // Navigate to ProjectTasks
                            className="flex items-center gap-2 px-2 py-1.5 flex-1 text-left rounded-l hover:bg-opacity-20"
                            style={{
                              color: project.color || '#EA580C'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${project.color || '#EA580C'}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {getProjectIcon(project.icon, 16, '', { color: project.color || '#EA580C' })}
                            <span>{project.name}</span>
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
                          <div className="px-2 text-xs font-medium" style={{ color: project.color || '#EA580C' }}>
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
                                className="w-full justify-start hover:bg-gray-100"
                                variant="ghost"
                                size="sm"
                                icon={getProjectIcon(subProject.icon, 16, '', { color: subProject.color || '#6B7280' })}
                                label={subProject.name}
                                labelStyle={{ color: subProject.color || '#6B7280' }}
                                endTextLabel={subProject.taskCount > 0 ? subProject.taskCount.toString() : undefined}
                                endTextLabelClassName="text-xs bg-gray-200 px-1.5 py-0.5 rounded"
                                endTextLabelStyle={{ color: subProject.color || '#6B7280' }}
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
                      className="w-full justify-start hover:bg-gray-100"
                      variant="ghost"
                      size="default"
                      icon={getProjectIcon(project.icon, 16, '', { color: project.color || '#6B7280' })}
                      label={project.name}
                      labelClassName=""
                      labelStyle={{ color: project.color || '#6B7280' }}
                      endTextLabel={project.taskCount > 0 ? project.taskCount.toString() : undefined}
                      endTextLabelClassName="text-xs bg-gray-200 px-1.5 py-0.5 rounded"
                      endTextLabelStyle={{ color: project.color || '#6B7280' }}
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
        <DialogContent className="w-[900px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
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