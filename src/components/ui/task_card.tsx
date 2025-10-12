import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/types';
import { TaskDetailModal } from '@/components/ui/task-detail-modal';
import { taskApi } from '@/lib/api/task';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';
import { sectionApi } from '@/lib/api/section';
import { useTaskCompletion } from '@/hooks/useTaskCompletion';
import {
  GripVertical,
  Edit3,
  Copy,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  Lock,
  Flag
} from 'lucide-react';

interface TaskCardProps {
  task: TaskItem;
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onDataRefresh?: () => Promise<void>;
  viewContext?: 'inbox' | 'today' | 'upcoming' | 'project' | 'completed';
  // Drag and drop props
  onTaskReorder?: (taskId: string, originalIndex: number, newIndex: number) => void;
  onTaskMoveToSection?: (taskId: string, targetSectionId: string) => void;
  taskIndex?: number;
  sectionId?: string;
  isDragDisabled?: boolean;
}

export function TaskCard({
  task,
  onUpdateTask,
  onDataRefresh,
  viewContext,
  onTaskReorder,
  onTaskMoveToSection,
  taskIndex,
  sectionId,
  isDragDisabled = false
}: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Use the universal completion hook
  const { handleTaskCompletion, handleSendToCompleted } = useTaskCompletion({
    onUpdateTask,
    onDataRefresh
  });

  // Priority color mapping for task text
  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-blue-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      case 'emergency': return 'text-red-700';
      default: return 'text-gray-900';
    }
  };

  // Priority flag color mapping using global CSS variables
  const getPriorityFlagColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-priority-low';
      case 'medium': return 'text-priority-medium';
      case 'high': return 'text-priority-high';
      case 'urgent': return 'text-priority-urgent';
      case 'emergency': return 'text-priority-emergency';
      default: return 'text-gray-400';
    }
  };

  // Get priority display text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'urgent': return 'Urgent';
      case 'emergency': return 'Emergency';
      default: return 'None';
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
    console.log('DEBUG: TaskCard handleToggleComplete called for task:', task.id, 'completed:', task.completed, 'viewContext:', viewContext);
    try {
      if (!task.completed) {
        // First click: Mark as completed and move to appropriate completed section
        await handleTaskCompletion(task, true, viewContext);
      } else {
        // Second click: Mark as totally completed (task will disappear)
        await handleSendToCompleted(task);
      }
      console.log('DEBUG: TaskCard handleToggleComplete completed successfully');
    } catch (error) {
      console.error('Error updating task completion in TaskCard:', error);
      // Optionally show an error message to the user
    }
  };

  const handleTaskClick = () => {
    setIsModalOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (isDragDisabled) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    const dragData = {
      taskId: task.id,
      taskName: task.name,
      originalSectionId: sectionId || task.section_id,
      originalIndex: taskIndex || 0,
      task: task
    };

    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';

    // Add a subtle drag image
    if (e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'rotate(5deg)';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDragDisabled) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isDragDisabled) return;

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      const { taskId, originalSectionId, originalIndex } = dragData;

      // Don't drop on self
      if (taskId === task.id) return;

      const currentSectionId = sectionId || task.section_id;

      if (originalSectionId === currentSectionId) {
        // Reordering within same section
        let newIndex = taskIndex || 0;

        // Calculate drop position based on mouse position within the task
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY;
        const taskMiddleY = rect.top + rect.height / 2;

        // If dropping below the middle of the task, insert after (index + 1)
        if (mouseY > taskMiddleY) {
          newIndex = newIndex + 1;
        }

        // Adjust for items being moved from earlier positions
        if (originalIndex < newIndex) {
          newIndex = newIndex - 1;
        }

        console.log('Drop positioning:', {
          mouseY,
          taskMiddleY,
          originalIndex,
          targetIndex: taskIndex,
          calculatedNewIndex: newIndex,
          dropBelow: mouseY > taskMiddleY
        });

        if (onTaskReorder && originalIndex !== newIndex) {
          onTaskReorder(taskId, originalIndex, newIndex);
        }
      } else {
        // Moving to different section
        if (onTaskMoveToSection && currentSectionId) {
          onTaskMoveToSection(taskId, currentSectionId);
        }
      }
    } catch (error) {
      console.error('Error handling task drop:', error);
    }
  };

  return (
    <>
      <div
        className={`w-full group transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${
          isDragOver ? 'bg-blue-50 border-blue-200 border-2 border-dashed rounded-lg' : ''
        }`}
        draggable={!isDragDisabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Task item */}
        <div className="flex items-center gap-3 py-2">
          {/* Drag handle */}
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 ${
              isDragDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab hover:cursor-grabbing'
            }`}
            onMouseDown={(e) => {
              if (!isDragDisabled) {
                e.currentTarget.style.cursor = 'grabbing';
              }
            }}
            onMouseUp={(e) => {
              if (!isDragDisabled) {
                e.currentTarget.style.cursor = 'grab';
              }
            }}
          >
            <GripVertical className={`h-4 w-4 ${
              isDragDisabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'
            }`} />
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
            <div className="flex items-center gap-2">
              <div className={`${task.completed ? 'text-gray-500 line-through' : getPriorityTextColor(task.piority)} font-normal`}>
                {task.name}
              </div>
              {/* Priority flag with color */}
              <div className="flex items-center gap-1">
                <Flag className={`h-3 w-3 ${getPriorityFlagColor(task.piority)}`} />
                <span className={`text-xs font-medium ${getPriorityFlagColor(task.piority)}`}>
                  {getPriorityText(task.piority)}
                </span>
              </div>
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
        onToggleCompletion={(taskId, completed) => handleTaskCompletion(task, completed, viewContext)}
        onSendToCompleted={() => handleSendToCompleted(task)}
      />
    </>
  );
}