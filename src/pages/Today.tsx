import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import {SectionDropdown} from '@/components/ui/task_section_dropdown';
import { SectionItem, TaskItem } from '@/types';
import { taskApi, sectionApi } from '@/lib/api';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';

export function Today() {
  // State for sections and tasks (loaded from API)
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [todaySection, setTodaySection] = useState<SectionItem | null>(null);

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const [showSectionTaskForms, setShowSectionTaskForms] = useState<{[key: string]: boolean}>({});

  // Load today data on component mount
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);

      // Get today's date string in YYYY-MM-DD format (local timezone, not UTC)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;

      // Load all tasks due today (regardless of project)
      const todayTasks = await taskApi.getTasksByDueDate(todayString);

      // Check if today's section exists, create if not
      const todaySectionName = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let currentTodaySection;
      try {
        // Try to find existing today section
        const existingSectionsResponse = await sectionApi.getTodaySections();
        const existingSections = existingSectionsResponse.results || existingSectionsResponse;

        if (Array.isArray(existingSections)) {
          currentTodaySection = existingSections.find((section: SectionItem) =>
            section.name === todaySectionName
          );

          // Also check for existing completed section
          const existingCompleted = existingSections.find((section: SectionItem) =>
            section.name === 'Completed'
          );

          if (!currentTodaySection) {
            // Create today's section if it doesn't exist
            currentTodaySection = await sectionApi.createTodaySection(todaySectionName);
          }

          // Include completed section if it exists
          const allSections = existingCompleted
            ? [currentTodaySection, existingCompleted]
            : [currentTodaySection];

          setSections(allSections);
          setTodaySection(currentTodaySection);

          // Set default expanded state
          const expandedState: {[key: string]: boolean} = {
            [currentTodaySection.id]: true
          };
          if (existingCompleted) {
            expandedState[existingCompleted.id] = true;
          }
          setExpandedSections(expandedState);
        }
      } catch (error) {
        console.error('Error finding/creating today section:', error);
        // Don't create fallback section to avoid duplicates
        // Instead, set an empty section list
        currentTodaySection = null;
        setSections([]);
        setExpandedSections({});
      }

      setTasks(todayTasks);

      // Legacy fallback for when no sections exist
      if (!currentTodaySection && sections.length === 0) {
        setTodaySection(null);
      }

    } catch (error) {
      console.error('Error loading today data:', error);
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




  const handleAddSectionTask = async (sectionId: string, newTask: any) => {
    try {
      // Only set default due date to today if user didn't specify one
      let dueDate: string | undefined = newTask.due_date;

      // If no due date provided, default to today's date
      if (!dueDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dueDate = `${year}-${month}-${day}`;
      }

      const taskData = {
        name: newTask.name,
        description: newTask.description || null,
        project_id: newTask.project_id || null, // Preserve project if specified
        section_id: sectionId,
        due_date: dueDate, // Respect user's choice or default to today
        priority: newTask.priority || "low"
      };

      const createdTask = await enhancedTaskApi.createTask(taskData);
      setTasks([...tasks, createdTask]);
    } catch (error) {
      console.error('Error creating today section task:', error);
    }
  };

  // Group tasks by section - handle completed tasks separately
  const tasksBySection = tasks.reduce((acc: {[key: string]: TaskItem[]}, task) => {
    // Check if task is completed and has a section_id pointing to completed section
    const completedSection = sections.find(s => s.name === 'Completed');
    if (task.completed && completedSection && task.section_id === completedSection.id) {
      // Task is completed and belongs to completed section
      if (!acc[completedSection.id]) acc[completedSection.id] = [];
      acc[completedSection.id].push(task);
      return acc;
    }

    // For Today view, ONLY show tasks that are actually due today
    // This is important because tasks may have current_view = ["today"] but not be due today
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Only include task if it's actually due today
    if (task.due_date === todayString) {
      const key = task.section_id || (todaySection ? todaySection.id : 'unsectioned');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
    }
    // If task is not due today, don't include it in Today view at all

    return acc;
  }, {});

  // No unsectioned tasks in Today view - all tasks go to today section
  const unsectionedTasks: TaskItem[] = [];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Today</h2>
        <div className="text-center text-gray-500 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Today</h2>

      <div className="mb-6">


        {/* Render today's section and any additional sections */}
        {sections.map((section, index) => {
          const sectionTasks = tasksBySection[section.id] || [];
          // Show section even if empty for today view

          return (
            <div key={section.id}>
              <SectionDropdown
                section={section}
                tasks={sectionTasks}
                onUpdateTask={updateTask}
                onToggleSection={toggleSection}
                isExpanded={expandedSections[section.id]}
                onDataRefresh={loadTodayData}
                viewContext="today"
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
                    currentContext={{ view: 'today', sectionId: section.id, sectionName: section.name }}
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

      </div>
    </div>
  );
}

export default Today;
