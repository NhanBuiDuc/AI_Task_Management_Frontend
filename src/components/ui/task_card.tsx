import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/types';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { taskApi } from '@/lib/api/task';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';
import { sectionApi } from '@/lib/api/section';
import {
  GripVertical,
  Edit3,
  Copy,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  Lock
} from 'lucide-react';

interface TaskCardProps {
  task: TaskItem;
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onDataRefresh?: () => Promise<void>;
  viewContext?: 'inbox' | 'today' | 'upcoming' | 'project' | 'completed';
}

export function TaskCard({ task, onUpdateTask, onDataRefresh, viewContext }: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-blue-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      case 'emergency': return 'text-red-700';
      default: return 'text-gray-900';
    }
  };

  // Calculate date color based on due date
  const getDateColor = (dueDate: string) => {
    if (!dueDate) return 'text-gray-400';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'text-green-500'; // Today
    if (diffDays === 1) return 'text-orange-500'; // Tomorrow
    if (diffDays >= 2 && diffDays <= 7) return 'text-purple-500'; // Next 7 days
    return 'text-gray-400'; // Further than 7 days
  };

  // Format date for display
  const formatDate = (dueDate: string) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleToggleComplete = async () => {
    console.log('DEBUG: handleToggleComplete called for task:', task.id, 'completed:', task.completed, 'viewContext:', viewContext);
    try {
      if (!task.completed) {
        console.log('DEBUG: First click - marking as completed');
        // First click: Mark as completed and move to "Completed" section

        // Special handling for Today view - move to Today completed section
        if (viewContext === 'today') {
          console.log('DEBUG: Today view - getting/creating Completed section for Today');
          // Get or create "Completed" section for Today view
          const { section, created } = await sectionApi.getOrCreateTodayCompletedSection();
          console.log('DEBUG: Got completed section for Today:', section, 'created:', created);

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
        } else if (viewContext === 'upcoming') {
          console.log('DEBUG: Upcoming view - getting/creating Completed section for Upcoming');
          // Get or create "Completed" section for Upcoming view
          const { section, created } = await sectionApi.getOrCreateUpcomingCompletedSection();
          console.log('DEBUG: Got completed section for Upcoming:', section, 'created:', created);

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
        } else if (task.project_id) {
          console.log('DEBUG: Project task - getting/creating Completed section for project:', task.project_id);
          // Get or create "Completed" section for this project
          const { section, created } = await sectionApi.getOrCreateCompletedSection(task.project_id);
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

          // Trigger data refresh only if a new "Completed" section was created
          if (created && onDataRefresh) {
            console.log('DEBUG: Triggering data refresh to show new Completed section');
            await onDataRefresh();
          }
        } else {
          console.log('DEBUG: Inbox task - getting/creating Completed section for Inbox');
          // For Inbox tasks, get or create "Completed" section with project_id = null
          const { section, created } = await sectionApi.getOrCreateInboxCompletedSection();
          console.log('DEBUG: Got completed section for Inbox:', section, 'created:', created);

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

          // Trigger data refresh only if a new "Completed" section was created
          if (created && onDataRefresh) {
            console.log('DEBUG: Triggering data refresh to show new Completed section');
            await onDataRefresh();
          }
        }
      } else {
        console.log('DEBUG: Second click - marking as totally completed');
        // Second click: Mark as totally completed (task will disappear)
        console.log('DEBUG: Calling updateTaskTotalCompletion for task:', task.id);
        const result = await enhancedTaskApi.updateTaskTotalCompletion(task.id, true);
        console.log('DEBUG: updateTaskTotalCompletion result:', result);

        // Remove from view by setting totally_completed and detaching from section
        onUpdateTask(task.id, {
          totally_completed: true,
          section_id: null
        });

        // Trigger data refresh to remove the totally_completed task from view
        if (onDataRefresh) {
          console.log('DEBUG: Triggering data refresh to remove totally_completed task from view');
          await onDataRefresh();
        }
      }
      console.log('DEBUG: handleToggleComplete completed successfully');
    } catch (error) {
      console.error('Error updating task completion:', error);
      // Optionally show an error message to the user
    }
  };

  const handleTaskClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-full group">
        {/* Task item */}
        <div className="flex items-center gap-3 py-2">
          {/* Drag handle */}
          <Button variant="ghost" size="sm" className="p-1 cursor-grab">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </Button>

          {/* Checkbox */}
          <div
            className={`w-5 h-5 border-2 ${task.completed ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} rounded-full flex items-center justify-center hover:border-gray-400 cursor-pointer`}
            onClick={(e) => {
              console.log('DEBUG: Checkbox clicked!', task.id, task.name);
              e.preventDefault();
              e.stopPropagation();
              handleToggleComplete();
            }}
          >
            {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>

          {/* Task text - clickable to open modal */}
          <div className="flex-1 cursor-pointer" onClick={handleTaskClick}>
            <div className={`${task.completed ? 'text-gray-500 line-through' : getPriorityColor(task.piority)} font-normal`}>
              {task.name}
            </div>
            {/* Calendar icon with date under task name */}
            {task.due_date && (
              <div className="flex items-center gap-1 mt-1">
                <Calendar className={`h-3 w-3 ${getDateColor(task.due_date)}`} />
                <span className={`text-xs font-medium ${getDateColor(task.due_date)}`}>
                  {formatDate(task.due_date)}
                </span>
              </div>
            )}
          </div>

          {/* Right side action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600" onClick={handleTaskClick}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Inbox label */}
          <div className="flex items-center gap-1 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span>Inbox</span>
            <Lock className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
        onUpdateTask={onUpdateTask}
      />
    </>
  );
}