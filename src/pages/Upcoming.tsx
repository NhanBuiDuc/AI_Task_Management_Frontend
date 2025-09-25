import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import {SectionDropdown} from '@/components/ui/task_section_dropdown';
import { SectionItem, TaskItem } from '@/types';
import { taskApi, sectionApi } from '@/lib/api';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';

export function Upcoming() {
  // State for sections and tasks (loaded from API)
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [showSectionTaskForms, setShowSectionTaskForms] = useState<{[key: string]: boolean}>({});

  // Load upcoming data on component mount
  useEffect(() => {
    loadUpcomingData();
  }, []);

  const loadUpcomingData = async () => {
    try {
      setLoading(true);

      // Calculate date ranges for This Week and Next Week (starting from current day)
      const today = new Date();

      // Calculate This Week (current day + 7 days)
      const thisWeekStart = new Date(today);
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(today.getDate() + 7);

      // Calculate Next Week (current day + 7 days + 1) to (current day + 7 days + 7)
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + 7 + 1); // current day + 7 + 1

      const nextWeekEnd = new Date(today);
      nextWeekEnd.setDate(today.getDate() + 7 + 7); // current day + 7 + 7

      // Format dates for display
      const formatDateRange = (start: Date, end: Date) => {
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${startStr} – ${endStr}`;
      };

      const thisWeekName = `This Week (${formatDateRange(thisWeekStart, thisWeekEnd)})`;
      const nextWeekName = `Next Week (${formatDateRange(nextWeekStart, nextWeekEnd)})`;

      // Create the two weekly sections with current_view = "upcoming"
      let thisWeekSection: SectionItem;
      let nextWeekSection: SectionItem;

      try {
        // Try to find existing sections or create them
        const existingSectionsResponse = await sectionApi.getUpcomingSections();
        const existingSections = existingSectionsResponse.results || existingSectionsResponse;

        // Find or create This Week section
        if (Array.isArray(existingSections)) {
          const existingThisWeek = existingSections.find((section: SectionItem) =>
            section.name.startsWith('This Week')
          );
          const existingNextWeek = existingSections.find((section: SectionItem) =>
            section.name.startsWith('Next Week')
          );
          const existingCompleted = existingSections.find((section: SectionItem) =>
            section.name === 'Completed'
          );

          // Update existing section names to current week dates, or create new ones
          if (existingThisWeek) {
            // Update the section name to reflect current week
            thisWeekSection = await sectionApi.updateSectionName(existingThisWeek.id, thisWeekName);
          } else {
            thisWeekSection = await sectionApi.createUpcomingSection(thisWeekName);
          }

          if (existingNextWeek) {
            // Update the section name to reflect current week
            nextWeekSection = await sectionApi.updateSectionName(existingNextWeek.id, nextWeekName);
          } else {
            nextWeekSection = await sectionApi.createUpcomingSection(nextWeekName);
          }

          // Check if completed section exists (don't create it here, will be created on first completion)
          // Just keep track of it if it exists
          const completedSection = existingCompleted;

          // Only include completed section in sections array if it exists
          const allSections = completedSection
            ? [thisWeekSection, nextWeekSection, completedSection]
            : [thisWeekSection, nextWeekSection];

          setSections(allSections);
        } else {
          // Create both sections if none exist
          thisWeekSection = await sectionApi.createUpcomingSection(thisWeekName);
          nextWeekSection = await sectionApi.createUpcomingSection(nextWeekName);
          setSections([thisWeekSection, nextWeekSection]);
        }
      } catch (error) {
        console.error('Error finding/creating upcoming sections:', error);
        // Create fallback sections
        thisWeekSection = {
          id: 'this-week-fallback',
          name: thisWeekName,
          project_id: null,
          current_view: ['upcoming']
        };
        nextWeekSection = {
          id: 'next-week-fallback',
          name: nextWeekName,
          project_id: null,
          current_view: ['upcoming']
        };
      }

      // Load tasks for upcoming dates (this week + next week)
      const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];
      const nextWeekEndStr = nextWeekEnd.toISOString().split('T')[0];

      // Get tasks due between today and end of next week
      const upcomingTasks = await taskApi.getTasksDueInDateRange(thisWeekStartStr, nextWeekEndStr);

      setTasks(upcomingTasks);

      // Note: setSections is now called inside the try block above to properly include completed section if it exists

      // Set default expanded state - get current sections from state
      const expandedState: {[key: string]: boolean} = {
        [thisWeekSection.id]: true,
        [nextWeekSection.id]: true
      };

      // Add completed section to expanded state if it exists
      const currentSections = sections.length > 0 ? sections : [thisWeekSection, nextWeekSection];
      const completedSection = currentSections.find(s => s.name === 'Completed');
      if (completedSection) {
        expandedState[completedSection.id] = true;
      }

      setExpandedSections(expandedState);

    } catch (error) {
      console.error('Error loading upcoming data:', error);
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
      // Only set default due date if user didn't specify one
      let dueDate: string | undefined = newTask.due_date;

      // If no due date provided, determine appropriate default based on section
      if (!dueDate) {
        const section = sections.find(s => s.id === sectionId);
        if (section?.name.startsWith('This Week')) {
          // Default to tomorrow for This Week
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dueDate = tomorrow.toISOString().split('T')[0];
        } else {
          // Default to first day of Next Week range
          const today = new Date();
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() + 7 + 1);
          dueDate = nextWeekStart.toISOString().split('T')[0];
        }
      }

      const taskData = {
        name: newTask.name,
        description: newTask.description || null,
        project_id: newTask.project_id || null,
        section_id: sectionId,
        due_date: dueDate,
        priority: newTask.priority || "low"
      };

      const createdTask = await enhancedTaskApi.createTask(taskData);
      setTasks([...tasks, createdTask]);
    } catch (error) {
      console.error('Error creating upcoming section task:', error);
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

    // For non-completed tasks, group by due date and week
    if (!task.due_date) return acc;

    const today = new Date();
    const taskDate = new Date(task.due_date);

    // Calculate This Week boundaries (current day to current day + 7)
    const thisWeekStart = new Date(today);
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() + 7);
    thisWeekEnd.setHours(23, 59, 59, 999);

    // Calculate Next Week boundaries (current day + 7 + 1) to (current day + 7 + 7)
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7 + 1);
    nextWeekStart.setHours(0, 0, 0, 0);

    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 7 + 7);
    nextWeekEnd.setHours(23, 59, 59, 999);

    const thisWeekSection = sections.find(s => s.name.startsWith('This Week'));
    const nextWeekSection = sections.find(s => s.name.startsWith('Next Week'));

    if (taskDate >= thisWeekStart && taskDate <= thisWeekEnd && thisWeekSection) {
      // Task is due this week
      if (!acc[thisWeekSection.id]) acc[thisWeekSection.id] = [];
      acc[thisWeekSection.id].push(task);
    } else if (taskDate >= nextWeekStart && taskDate <= nextWeekEnd && nextWeekSection) {
      // Task is due next week
      if (!acc[nextWeekSection.id]) acc[nextWeekSection.id] = [];
      acc[nextWeekSection.id].push(task);
    }

    return acc;
  }, {});

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming</h2>
        <div className="text-center text-gray-500 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming</h2>

      <div className="mb-6">
        {/* Render weekly sections */}
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
                onDataRefresh={loadUpcomingData}
                viewContext="upcoming"
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
                    currentContext={{ view: 'upcoming', sectionId: section.id, sectionName: section.name }}
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

export default Upcoming;