import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';
import { sectionApi } from '@/lib/api/section';
import { TaskItem, RepeativeFrequency } from '@/types';

interface UseTaskCompletionProps {
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onDataRefresh?: () => Promise<void>;
}

// Helper function to calculate the next due date based on repeat frequency
const calculateNextDueDate = (currentDueDate: string, repeatFrequency: string): string => {
  const currentDate = new Date(currentDueDate);

  switch (repeatFrequency) {
    case 'every day':
    case 'every_day':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'every week':
    case 'every_week':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'every month':
    case 'every_month':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'every year':
    case 'every_year':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown repeat frequency: ${repeatFrequency}`);
  }

  // Return in YYYY-MM-DD format
  return currentDate.toISOString().split('T')[0];
};

export const useTaskCompletion = ({ onUpdateTask, onDataRefresh }: UseTaskCompletionProps) => {

  const handleTaskCompletion = async (
    task: TaskItem,
    completed: boolean,
    viewContext?: 'inbox' | 'today' | 'upcoming' | 'project' | 'completed'
  ) => {
    console.log('DEBUG: Universal completion hook called for task:', task.id, 'completed:', completed, 'viewContext:', viewContext);

    try {
      if (completed) {
        // Check if this is a repeating task
        if (task.repeat && ['every day', 'every week', 'every month', 'every year'].includes(task.repeat)) {
          console.log('DEBUG: Task has repeat frequency:', task.repeat, '- updating due date instead of completing');

          // Calculate next due date
          const nextDueDate = calculateNextDueDate(task.due_date, task.repeat);
          console.log('DEBUG: Next due date calculated:', nextDueDate);

          // Update the task with new due date and keep it active (not completed)
          await enhancedTaskApi.updateTask(task.id, {
            due_date: nextDueDate,
            completed: false, // Keep task active
            // Don't change section - keep task in current location
          });

          // Update local state with new due date
          onUpdateTask(task.id, {
            due_date: nextDueDate,
            completed: false,
          });

          // Trigger data refresh to update UI with new due date
          if (onDataRefresh) {
            console.log('DEBUG: Triggering data refresh to update UI with new due date');
            await onDataRefresh();
          }

          console.log('DEBUG: Repeating task updated successfully with new due date:', nextDueDate);
          return; // Exit early - don't proceed with normal completion
        }

        console.log('DEBUG: Non-repeating task - proceeding with normal completion');

        // Determine the appropriate completed section based on view context
        let section;
        let created = false;

        if (viewContext === 'today') {
          console.log('DEBUG: Today view - getting/creating Completed section for Today');
          const result = await sectionApi.getOrCreateTodayCompletedSection();
          section = result.section;
          created = result.created;
        } else if (viewContext === 'upcoming') {
          console.log('DEBUG: Upcoming view - getting/creating Completed section for Upcoming');
          const result = await sectionApi.getOrCreateUpcomingCompletedSection();
          section = result.section;
          created = result.created;
        } else if (task.project_id) {
          console.log('DEBUG: Project task - getting/creating Completed section for project:', task.project_id);
          const result = await sectionApi.getOrCreateCompletedSection(task.project_id);
          section = result.section;
          created = result.created;
        } else {
          console.log('DEBUG: Inbox task - getting/creating Completed section for Inbox');
          const result = await sectionApi.getOrCreateInboxCompletedSection();
          section = result.section;
          created = result.created;
        }

        console.log('DEBUG: Got completed section:', section, 'created:', created);

        // Move task to completed section and mark as completed
        console.log('DEBUG: Moving task to section:', section.id);
        await enhancedTaskApi.moveTaskToSection(task.id, section.id);

        console.log('DEBUG: Marking task as completed');
        await enhancedTaskApi.updateTaskCompletion(task.id, true);

        // Update local state
        console.log('DEBUG: Updating local state');
        onUpdateTask(task.id, {
          completed: true,
          section_id: section.id
        });

        // Trigger data refresh if a new "Completed" section was created
        if (created && onDataRefresh) {
          console.log('DEBUG: Triggering data refresh to show new Completed section');
          await onDataRefresh();
        }

      } else {
        console.log('DEBUG: Marking task as not completed');
        // Mark as not completed
        await enhancedTaskApi.updateTaskCompletion(task.id, false);

        // Update local state
        console.log('DEBUG: Updating local state to not completed');
        onUpdateTask(task.id, {
          completed: false
        });

        // Optionally trigger refresh to update UI
        if (onDataRefresh) {
          console.log('DEBUG: Triggering data refresh after uncompleting task');
          await onDataRefresh();
        }
      }

      console.log('DEBUG: Universal completion hook completed successfully');
    } catch (error) {
      console.error('Error in universal task completion hook:', error);
      throw error; // Re-throw so calling components can handle the error
    }
  };

  const handleSendToCompleted = async (task: TaskItem) => {
    console.log('DEBUG: Universal send to completed hook called for task:', task.id);

    try {
      console.log('DEBUG: Marking task as totally completed');
      await enhancedTaskApi.updateTaskTotalCompletion(task.id, true);

      // Update local state
      console.log('DEBUG: Updating local state to totally completed');
      onUpdateTask(task.id, {
        totally_completed: true,
        section_id: null // Remove from current section
      });

      // Trigger data refresh to remove the totally_completed task from view
      if (onDataRefresh) {
        console.log('DEBUG: Triggering data refresh to remove totally_completed task from view');
        await onDataRefresh();
      }

      console.log('DEBUG: Send to completed hook completed successfully');
    } catch (error) {
      console.error('Error in send to completed hook:', error);
      throw error;
    }
  };

  return {
    handleTaskCompletion,
    handleSendToCompleted
  };
};