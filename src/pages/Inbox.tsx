import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import {SectionDropdown} from '@/components/ui/task_section_dropdown';
import { AddSectionHover } from '@/components/ui/add-section-hover';
import { SectionItem, TaskItem } from '@/types';
import { taskApi, sectionApi } from '@/lib/api';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';


export function Inbox() {
  // State for sections and tasks (loaded from API)
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [showUnsectionedTaskForm, setShowUnsectionedTaskForm] = useState(false);
  const [showSectionTaskForms, setShowSectionTaskForms] = useState<{[key: string]: boolean}>({});

  // Load inbox data on component mount
  useEffect(() => {
    loadInboxData();
  }, []);

  const loadInboxData = async () => {
    try {
      setLoading(true);

      // Load tasks with current_view = "inbox"
      const inboxTasks = await taskApi.getTasksByView('inbox');

      // Load inbox sections (project_id = null)
      const inboxSectionsResponse = await sectionApi.getInboxSections();
      const inboxSections = inboxSectionsResponse.results || inboxSectionsResponse;

      setTasks(inboxTasks);
      setSections(inboxSections);

      // Set default expanded state for sections
      const defaultExpanded: {[key: string]: boolean} = {};
      if (Array.isArray(inboxSections)) {
        inboxSections.forEach(section => {
          defaultExpanded[section.id] = true; // Expand all sections by default
        });
      }
      setExpandedSections(defaultExpanded);

    } catch (error) {
      console.error('Error loading inbox data:', error);
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


  const handleAddUnsectionedTask = async (newTask: any) => {
    try {
      const createdTask = await enhancedTaskApi.createTask(newTask);

      // Only add the task to Inbox view if it actually belongs to Inbox (project_id is null)
      if (createdTask.project_id === null || createdTask.project_id === undefined) {
        setTasks([...tasks, createdTask]);
      }
      // If task was created with a project_id, it belongs to a project, not Inbox

      setShowUnsectionedTaskForm(false);
    } catch (error) {
      console.error('Error creating unsectioned task:', error);
    }
  };

  const handleAddSection = async (sectionName: string) => {
    try {
      const createdSection = await sectionApi.createInboxSection(sectionName);
      setSections([...sections, createdSection]);
      setExpandedSections(prev => ({...prev, [createdSection.id]: true})); // Expand new section
      console.log("Adding new section:", createdSection);
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      // Remove section from state
      setSections(sections.filter(section => section.id !== sectionId));

      // Remove section from expanded state
      setExpandedSections(prev => {
        const newState = { ...prev };
        delete newState[sectionId];
        return newState;
      });

      // Remove section from task forms state
      setShowSectionTaskForms(prev => {
        const newState = { ...prev };
        delete newState[sectionId];
        return newState;
      });

      // Remove tasks that belonged to this section from local state
      setTasks(tasks.filter(task => task.section_id !== sectionId));

      console.log("Section deleted:", sectionId);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleAddSectionTask = async (sectionId: string, newTask: any) => {
    try {
      const createdTask = await enhancedTaskApi.createTask(newTask);

      // Only add the task to Inbox view if it actually belongs to Inbox (project_id is null)
      if (createdTask.project_id === null || createdTask.project_id === undefined) {
        setTasks([...tasks, createdTask]);
      }
      // If task was created with a project_id, it belongs to a project, not Inbox

    } catch (error) {
      console.error('Error creating section task:', error);
    }
  };

  // Group tasks by section
  const tasksBySection = tasks.reduce((acc: {[key: string]: TaskItem[]}, task) => {
    const key = task.section_id || 'unsectioned';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {});

  // Get unsectioned tasks AND tasks whose sections aren't loaded (cross-view tasks)
  const loadedSectionIds = new Set(sections.map(s => s.id));
  const unsectionedTasks = (tasksBySection['unsectioned'] || []);

  // Find tasks that belong to sections not in our inbox sections list
  const crossViewTasks = Object.entries(tasksBySection)
    .filter(([sectionId, _]) => sectionId !== 'unsectioned' && !loadedSectionIds.has(sectionId))
    .flatMap(([_, tasks]) => tasks);

  // Combine unsectioned and cross-view tasks for display
  const allUnsectionedTasks = [...unsectionedTasks, ...crossViewTasks];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inbox</h2>
        <div className="text-center text-gray-500 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inbox</h2>
      
      <div className="mb-6">
        {/* Unsectioned Tasks Section - treated as its own section */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          {/* Unsectioned tasks content (includes cross-view tasks) */}
          {allUnsectionedTasks.length > 0 && (
            <div className="mb-3">
              {allUnsectionedTasks.map((task, index) => (
                <div key={`unsectioned-${task.id || index}`}>
                  <TaskCard
                    task={task}
                    onUpdateTask={updateTask}
                    onDataRefresh={loadInboxData}
                  />
                  {index < allUnsectionedTasks.length - 1 && (
                    <div className="border-b border-gray-200 my-1"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Task button for unsectioned tasks */}
          <div>
            {showUnsectionedTaskForm ? (
              <TaskForm
                onSubmit={handleAddUnsectionedTask}
                onCancel={() => setShowUnsectionedTaskForm(false)}
                currentContext={{ view: 'inbox' }}
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

          return (
            <div key={section.id}>
              <SectionDropdown
                section={section}
                tasks={sectionTasks}
                onUpdateTask={updateTask}
                onToggleSection={toggleSection}
                isExpanded={expandedSections[section.id]}
                onSectionDelete={handleDeleteSection}
                onDataRefresh={loadInboxData}
              />

              {/* Add Task button for this section */}
              <div className="ml-4 mb-2">
                {showSectionTaskForms[section.id] ? (
                  <TaskForm
                    onSubmit={(newTask) => {
                      handleAddSectionTask(section.id, newTask);
                      setShowSectionTaskForms(prev => ({...prev, [section.id]: false}));
                    }}
                    onCancel={() => setShowSectionTaskForms(prev => ({...prev, [section.id]: false}))}
                    currentContext={{ view: 'inbox', sectionId: section.id, sectionName: section.name }}
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
            </div>
          );
        })}

        {/* Single Add section hover area at the end */}
        <AddSectionHover onAddSection={handleAddSection} />
      </div>
    </div>
  );
}

export default Inbox;