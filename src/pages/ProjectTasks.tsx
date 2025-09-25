import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle, ArrowLeft, Settings, Edit, Trash2, Check, Palette, Zap } from 'lucide-react';
import { getProjectIcon } from '@/lib/iconMapping';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  FolderIcon,
  Hash,
  Star,
  Heart,
  Calendar,
  Clock,
  Target,
  Coffee,
  Home,
  Briefcase,
  BookOpen,
  Music,
  Camera,
  Gamepad2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SectionDropdown } from '@/components/ui/task_section_dropdown';
import { AddSectionHover } from '@/components/ui/add-section-hover';
import { ProjectItem, SectionItem, TaskItem } from "@/types";
import { projectApi } from '@/lib/api/project';
import { sectionApi } from '@/lib/api/section';
import { taskApi } from '@/lib/api/task';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';


interface ProjectTasksProps {
  projectId: string;
  onBackToProjects: () => void;
  onProjectUpdate?: () => void;
}

export function ProjectTasks({ projectId, onBackToProjects, onProjectUpdate }: ProjectTasksProps) {
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [showUnsectionedTaskForm, setShowUnsectionedTaskForm] = useState(false);
  const [showSectionTaskForms, setShowSectionTaskForms] = useState<{[key: string]: boolean}>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isIconOpen, setIsIconOpen] = useState(false);
  const [isUpdatingIcon, setIsUpdatingIcon] = useState(false);
  const [isUpdatingColor, setIsUpdatingColor] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Color and icon options (matching project form)
  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', color: 'bg-blue-500', hexColor: '#3B82F6' },
    { value: '#EF4444', label: 'Red', color: 'bg-red-500', hexColor: '#EF4444' },
    { value: '#10B981', label: 'Green', color: 'bg-green-500', hexColor: '#10B981' },
    { value: '#F59E0B', label: 'Yellow', color: 'bg-yellow-500', hexColor: '#F59E0B' },
    { value: '#8B5CF6', label: 'Purple', color: 'bg-purple-500', hexColor: '#8B5CF6' },
    { value: '#F97316', label: 'Orange', color: 'bg-orange-500', hexColor: '#F97316' },
    { value: '#EC4899', label: 'Pink', color: 'bg-pink-500', hexColor: '#EC4899' },
    { value: '#6B7280', label: 'Gray', color: 'bg-gray-500', hexColor: '#6B7280' }
  ];

  const iconOptions = [
    { value: 'folder', label: 'Folder', icon: FolderIcon },
    { value: 'hash', label: 'Hash', icon: Hash },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'calendar', label: 'Calendar', icon: Calendar },
    { value: 'clock', label: 'Clock', icon: Clock },
    { value: 'target', label: 'Target', icon: Target },
    { value: 'zap', label: 'Zap', icon: Zap },
    { value: 'coffee', label: 'Coffee', icon: Coffee },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'briefcase', label: 'Briefcase', icon: Briefcase },
    { value: 'book', label: 'Book', icon: BookOpen },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'camera', label: 'Camera', icon: Camera },
    { value: 'gamepad', label: 'Gamepad', icon: Gamepad2 },
    { value: 'palette', label: 'Palette', icon: Palette }
  ];

  // Load project-specific data based on projectId
  useEffect(() => {
    loadProjectData(projectId);
  }, [projectId]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  // Refresh project data from API
  const refreshProjectData = async () => {
    if (!projectId) return;
    await loadProjectData(projectId);
  };

  // Load project data using real API calls
  const loadProjectData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading project data for ID:', id);

      // Load project, sections, and tasks in parallel
      const [project, sectionsResponse, tasksResponse] = await Promise.all([
        projectApi.getProjectById(id),
        sectionApi.getSectionsByProject(id),
        taskApi.getTasksByProject(id)
      ]);

      // Extract results from paginated responses
      const sections = sectionsResponse.results || sectionsResponse;
      const tasks = tasksResponse.results || tasksResponse;

      console.log('Loaded project:', project);
      console.log('Loaded sections:', sections);
      console.log('Loaded tasks:', tasks);

      // Update state with loaded data
      setProject(project);
      setSections(sections);
      setTasks(tasks);

      // Set initial expanded state for sections
      const initialExpanded = sections.reduce((acc: {[key: string]: boolean}, section) => {
        acc[section.id] = true; // Default to expanded
        return acc;
      }, {});
      setExpandedSections(initialExpanded);

    } catch (error) {
      console.error('Error loading project data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load project data');
      setProject(null);
      setSections([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = (taskId: string, updates: Partial<TaskItem>) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };



  const handleAddSection = async (sectionData: SectionItem | string) => {
    // If it's a SectionItem (from API), add to state and refresh data
    if (typeof sectionData === 'object') {
      setSections([...sections, sectionData]);
      console.log("Adding new section from API:", sectionData);
      // Refresh all data to ensure consistency
      await refreshProjectData();
    } else {
      // Legacy string handling (should not be used in project context)
      console.warn("Legacy mode should not be used in project context");
    }
  };

  const handleAddSectionTask = async (sectionId: string, taskData: Partial<TaskItem>) => {
    try {
      // Use the project_id from taskData if explicitly provided (for cross-project insertion),
      // including null for Inbox tasks, otherwise fall back to current projectId
      const targetProjectId = taskData.project_id !== undefined ? taskData.project_id : projectId;
      console.log("Creating task in section:", sectionId, "project:", targetProjectId, taskData);

      // Create task using appropriate API call
      let newTask;
      if (targetProjectId === null) {
        // Creating Inbox task in section - use general createTask API
        newTask = await enhancedTaskApi.createTask(taskData);
      } else {
        // Creating project task in section - use createTaskInSection API
        newTask = await enhancedTaskApi.createTaskInSection(targetProjectId, sectionId, {
          name: taskData.name || 'New Task',
          description: taskData.description || null,
          due_date: taskData.due_date || '',
          piority: taskData.piority || 'low',
          completed: false,
          totally_completed: false,
          reminder_date: taskData.reminder_date
        });
      }

      console.log("Created task:", newTask);

      // Refresh all data to ensure consistency
      await refreshProjectData();
    } catch (error) {
      console.error('Failed to create task in section:', error);
    }
  };

  const handleAddUnsectionedTask = async (taskData: Partial<TaskItem>) => {
    try {
      // Use the project_id from taskData if explicitly provided (for cross-project insertion),
      // including null for Inbox tasks, otherwise fall back to current projectId
      const targetProjectId = taskData.project_id !== undefined ? taskData.project_id : projectId;
      console.log("Creating unsectioned task in project:", targetProjectId, taskData);

      // Create task using appropriate API call
      let newTask;
      if (targetProjectId === null) {
        // Creating Inbox task - use general createTask API
        newTask = await enhancedTaskApi.createTask(taskData);
      } else {
        // Creating project task - use createTaskInProject API
        newTask = await enhancedTaskApi.createTaskInProject(targetProjectId, {
          name: taskData.name || 'New Task',
          description: taskData.description || null,
          due_date: taskData.due_date || '',
          piority: taskData.piority || 'low',
          section_id: null,
          completed: false,
          totally_completed: false,
          reminder_date: taskData.reminder_date
        });
      }

      console.log("Created unsectioned task:", newTask);

      // Refresh all data to ensure consistency
      await refreshProjectData();
    } catch (error) {
      console.error('Failed to create unsectioned task:', error);
    }
  };

  const handleRenameProject = () => {
    if (project) {
      setEditedName(project.name);
      setIsRenaming(true);
      setShowDropdown(false);
    }
  };

  const handleConfirmRename = async () => {
    if (!project || !editedName.trim() || editedName === project.name) {
      setIsRenaming(false);
      return;
    }

    try {
      setIsUpdatingName(true);
      const updatedProject = await projectApi.updateProjectName(project.id, editedName.trim());
      setProject(updatedProject);
      setIsRenaming(false);
      console.log('Project renamed successfully:', updatedProject.name);

      // Notify parent component to reload projects list
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error renaming project:', error);
      // Reset to original name on error
      setEditedName(project.name);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setEditedName('');
  };

  const handleDeleteProject = () => {
    setShowDeleteDialog(true);
    setShowDropdown(false);
    setDeleteConfirmationName('');
  };

  const handleConfirmDelete = async () => {
    if (!project || deleteConfirmationName !== project.name) {
      return;
    }

    try {
      setIsDeleting(true);
      await projectApi.deleteProject(project.id);
      console.log('Project deleted successfully:', project.name);

      // Notify parent component to reload projects list
      if (onProjectUpdate) {
        onProjectUpdate();
      }

      // Navigate back to projects list
      onBackToProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmationName('');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmationName('');
  };

  const handleUpdateIcon = async (iconValue: string) => {
    if (!project || project.icon === iconValue) {
      setIsIconOpen(false);
      return;
    }

    try {
      setIsUpdatingIcon(true);
      const updatedProject = await projectApi.updateProject(project.id, {
        icon: iconValue
      });
      setProject(updatedProject);
      setIsIconOpen(false);
      console.log('Project icon updated successfully:', iconValue);

      // Notify parent component to reload projects list
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error updating project icon:', error);
    } finally {
      setIsUpdatingIcon(false);
    }
  };

  const handleUpdateColor = async (colorValue: string) => {
    if (!project || project.color === colorValue) {
      setIsColorOpen(false);
      return;
    }

    try {
      setIsUpdatingColor(true);
      const updatedProject = await projectApi.updateProject(project.id, {
        color: colorValue
      });
      setProject(updatedProject);
      setIsColorOpen(false);
      console.log('Project color updated successfully:', colorValue);

      // Notify parent component to reload projects list
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error updating project color:', error);
    } finally {
      setIsUpdatingColor(false);
    }
  };

  // Filter out totally completed tasks and group by section
  const activeTasks = tasks.filter(task => !task.totally_completed);
  const tasksBySection = activeTasks.reduce((acc: {[key: string]: TaskItem[]}, task) => {
    const key = task.section_id || 'unsectioned';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {});

  // Get unsectioned tasks
  const unsectionedTasks = tasksBySection['unsectioned'] || [];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBackToProjects}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">Error Loading Project</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadProjectData(projectId)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No project found
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBackToProjects}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">Project Not Found</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header with back button and project info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmRename();
                    } else if (e.key === 'Escape') {
                      handleCancelRename();
                    }
                  }}
                  disabled={isUpdatingName}
                />
                <button
                  onClick={handleConfirmRename}
                  disabled={isUpdatingName || !editedName.trim() || editedName === project.name}
                  className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Confirm rename"
                >
                  <Check className="h-5 w-5 text-green-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {getProjectIcon(project.icon, 24, '', { color: project.color || '#3B82F6' })}
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: project.color || '#3B82F6' }}
                >
                  {project.name}
                </h2>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Project ID: {project.id}
              {project.parent_id && ` (Sub-project of ${project.parent_id})`}
            </p>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={handleRenameProject}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <Edit className="h-4 w-4" />
                  Rename
                </button>

                {/* Icon Selection */}
                <div className="px-4 py-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Change Icon
                  </label>
                  <Popover open={isIconOpen} onOpenChange={setIsIconOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-8"
                        disabled={isUpdatingIcon}
                      >
                        <div className="flex items-center gap-2">
                          {getProjectIcon(project.icon, 16, '', { color: project.color || '#3B82F6' })}
                          <span className="text-xs">
                            {iconOptions.find(i => i.value === project.icon)?.label || 'Folder'}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                        {iconOptions.map((iconOption) => {
                          const Icon = iconOption.icon;
                          return (
                            <button
                              key={iconOption.value}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpdateIcon(iconOption.value);
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpdateIcon(iconOption.value);
                              }}
                              className="flex flex-col items-center gap-1 p-2 text-xs hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                              title={iconOption.label}
                              disabled={isUpdatingIcon}
                            >
                              <Icon className="h-4 w-4" style={{ color: project.color || '#3B82F6' }} />
                              <span className="truncate w-full text-center">{iconOption.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Color Selection */}
                <div className="px-4 py-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Change Color
                  </label>
                  <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-8"
                        disabled={isUpdatingColor}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: project.color || '#3B82F6' }}
                          ></div>
                          <span className="text-xs">
                            {colorOptions.find(c => c.hexColor === project.color)?.label || 'Blue'}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                      <div className="grid grid-cols-2 gap-1">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUpdateColor(color.hexColor);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUpdateColor(color.hexColor);
                            }}
                            className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-gray-100 rounded-md text-left transition-colors cursor-pointer"
                            disabled={isUpdatingColor}
                          >
                            <div className={`w-3 h-3 rounded-full ${color.color}`}></div>
                            {color.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleDeleteProject}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        {/* Unsectioned Tasks Section - treated as its own section */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          {/* Unsectioned tasks content */}
          {unsectionedTasks.length > 0 && (
            <div className="mb-3">
              {unsectionedTasks.map((task, index) => (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    onUpdateTask={updateTask}
                    onDataRefresh={refreshProjectData}
                  />
                  {index < unsectionedTasks.length - 1 && (
                    <div className="border-b border-gray-200 my-1"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Show message when no tasks exist */}
          {activeTasks.length === 0 && (
            <div className="text-center py-4 mb-3">
              <p className="text-gray-500 text-sm">No tasks yet. Add your first task to get started!</p>
            </div>
          )}

          {/* Add Task button for unsectioned tasks - always visible */}
          <div>
            {showUnsectionedTaskForm ? (
              <TaskForm
                onSubmit={async (taskData) => {
                  // Check if a section was selected in the task data
                  if (taskData.section_id) {
                    // If section is selected, call handleAddSectionTask
                    await handleAddSectionTask(taskData.section_id, taskData);
                  } else {
                    // If no section selected, call handleAddUnsectionedTask
                    await handleAddUnsectionedTask(taskData);
                  }
                  setShowUnsectionedTaskForm(false);
                }}
                onCancel={() => setShowUnsectionedTaskForm(false)}
                currentContext={{
                  view: 'project',
                  projectId: projectId,
                  projectName: project?.name
                }}
              />
            ) : (
              <IconTextButton
                onClick={() => setShowUnsectionedTaskForm(true)}
                icon={
                  <div className="relative h-5 w-5">
                    <Plus className="h-5 w-5 text-orange-500 group-hover:opacity-0 opacity-100 transition-opacity duration-200 absolute inset-0" />
                    <PlusCircle className="h-5 w-5 text-orange-500 group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute inset-0" />
                  </div>
                }
                label="Add Task"
                variant="ghost"
                className="group text-black hover:text-orange-500 transition-colors duration-200"
                iconClassName="transition-all duration-200"
              />
            )}
          </div>
        </div>


        {/* Render sections with their tasks BELOW unsectioned tasks */}
        {sections.map((section, index) => {
          const sectionTasks = tasksBySection[section.id] || [];
          // Show sections even if they're empty so users can add tasks to them

          return (
            <div key={section.id}>
              <SectionDropdown
                section={section}
                tasks={sectionTasks}
                onUpdateTask={updateTask}
                onToggleSection={toggleSection}
                isExpanded={expandedSections[section.id]}
                onDataRefresh={refreshProjectData}
              />

              {/* Add Task button for this section */}
              <div className="ml-4 mb-2">
                {showSectionTaskForms[section.id] ? (
                  <TaskForm
                    onSubmit={async (taskData) => {
                      await handleAddSectionTask(section.id, taskData);
                      setShowSectionTaskForms(prev => ({...prev, [section.id]: false}));
                    }}
                    onCancel={() => setShowSectionTaskForms(prev => ({...prev, [section.id]: false}))}
                    currentContext={{
                      view: 'project',
                      projectId: projectId,
                      projectName: project?.name,
                      sectionId: section.id,
                      sectionName: section.name
                    }}
                  />
                ) : (
                  <IconTextButton
                    onClick={() => setShowSectionTaskForms(prev => ({...prev, [section.id]: true}))}
                    icon={
                      <div className="relative h-5 w-5">
                        <Plus className="h-5 w-5 text-orange-500 group-hover:opacity-0 opacity-100 transition-opacity duration-200 absolute inset-0" />
                        <PlusCircle className="h-5 w-5 text-orange-500 group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute inset-0" />
                      </div>
                    }
                    label="Add Task"
                    variant="ghost"
                    className="group text-black hover:text-orange-500 transition-colors duration-200"
                    iconClassName="transition-all duration-200"
                  />
                )}
              </div>

              {/* Add section hover area after each section */}
              <AddSectionHover projectId={projectId} onAddSection={handleAddSection} onCreate={refreshProjectData} />
            </div>
          );
        })}

        {/* Add section hover area at the end if no sections exist */}
        {sections.length === 0 && (
          <AddSectionHover projectId={projectId} onAddSection={handleAddSection} onCreate={refreshProjectData} />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the project{' '}
                <span className="font-semibold text-red-600">"{project?.name}"</span>?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This action cannot be undone. All tasks and sections in this project will be permanently deleted.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-2">
                To confirm, type the project name exactly:
              </p>
              <input
                type="text"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={project?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
                disabled={isDeleting}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationName !== project?.name || isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTasks;