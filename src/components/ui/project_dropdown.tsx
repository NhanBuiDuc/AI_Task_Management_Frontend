  
  // src\components\ui\project_dropdown.tsx

  import { IconTextButton } from '@/components/ui/icon_text_button';
  import { Plus, PlusCircle, ChevronDown, ChevronRight, MoreHorizontal, Hash } from 'lucide-react';
  import { useState } from 'react';

  interface Project {
    id: number;
    name: string;
    parent_id: number | null;
  }

  interface ProjectDropdownProps {
    project: Project;
    subProjects: Project[];
    onSelectProject: (projectId: number) => void;
    onToggleProject: (projectId: number) => void;
    isExpanded: boolean;
    selectedProjectId?: number;
  }

  export function ProjectDropdown({
    project,
    subProjects,
    onSelectProject,
    onToggleProject,
    isExpanded,
    selectedProjectId
  }: ProjectDropdownProps) {
    const hasSubProjects = subProjects.length > 0;
    const isSelected = selectedProjectId === project.id;

    // If project has sub-projects, render with dropdown functionality
    if (hasSubProjects) {
      return (
        <div className="mb-1">
          {/* Parent Project with separate click areas */}
          <div className="flex items-center group hover:bg-gray-100 rounded">
            {/* Main project button - clickable for navigation */}
            <button
              onClick={() => onSelectProject(project.id)}
              className={`flex items-center gap-2 px-2 py-1.5 flex-1 text-left rounded-l ${
                isSelected ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Hash className="h-4 w-4" />
              <span className="font-medium">{project.name}</span>
              {project.name === "Getting Started" && <span>💡</span>}
            </button>

            {/* Dropdown toggle button - separate click area */}
            <button
              onClick={() => onToggleProject(project.id)}
              className="p-1.5 hover:bg-gray-200 rounded-r text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* Task count or more options */}
            <div className="px-2 text-xs text-orange-500 font-medium">
              8
            </div>
          </div>

          {/* Sub Projects */}
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {subProjects.map((subProject) => (
                <button
                  key={subProject.id}
                  onClick={() => onSelectProject(subProject.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 w-full text-left rounded ${
                    selectedProjectId === subProject.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Hash className="h-4 w-4" />
                  <span>{subProject.name}</span>
                  {subProject.name === "sub" && (
                    <div className="ml-auto text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                      1
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // If project has no sub-projects, render as simple button
    return (
      <div className="mb-1">
        <button
          onClick={() => onSelectProject(project.id)}
          className={`flex items-center gap-2 px-2 py-1.5 w-full text-left rounded group hover:bg-gray-100 ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>{project.name}</span>
          <div className="ml-auto flex items-center gap-2">
            {/* Task count */}
            {project.name === "Notes and Reference Materials" && (
              <div className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                2
              </div>
            )}
            {project.name === "board" && (
              <div className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                1
              </div>
            )}
            {/* More options (visible on hover) */}
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        </button>
      </div>
    );
  }

