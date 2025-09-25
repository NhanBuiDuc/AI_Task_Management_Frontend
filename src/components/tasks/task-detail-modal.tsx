import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Clock, Flag, Trash2, Edit, Check, X } from 'lucide-react';
import { TaskItem, Piority } from '@/types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskDetailModal({ isOpen, onClose, task, onUpdateTask, onDeleteTask }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<TaskItem | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onUpdateTask(task.id, {
        name: editedTask.name,
        description: editedTask.description,
        due_date: editedTask.due_date,
        piority: editedTask.piority,
        // startTime: editedTask.startTime, // Not available in TaskItem
        // endTime: editedTask.endTime, // Not available in TaskItem
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const toggleCompleted = () => {
    const newCompleted = !task.completed;
    onUpdateTask(task.id, { completed: newCompleted });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const priorityOptions: { value: Piority; label: string; color: string; bgColor: string }[] = [
    { value: 'emergency', label: 'Emergency', color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-100' },
    { value: 'high', label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { value: 'medium', label: 'Medium', color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { value: 'low', label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-100' },
  ];

  const currentPriority = priorityOptions.find(p => p.value === editedTask.piority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📋 Task Details
            </span>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCompleted}
                className={task.completed ? 'text-green-600' : 'text-gray-400'}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Status */}
          <div className={`p-3 rounded-lg ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
              <span className="font-medium">
                {task.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            {isEditing ? (
              <Input
                value={editedTask.name}
                onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                className="w-full"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-900">{task.name}</h3>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Add a description..."
                className="w-full min-h-[80px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                <p className="text-gray-700">
                  {task.description || 'No description provided'}
                </p>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            {isEditing ? (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {formatDate(new Date(editedTask.due_date))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(editedTask.due_date)}
                    onSelect={(date) => {
                      if (date) {
                        setEditedTask({ ...editedTask, due_date: date.toISOString().split('T')[0] });
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span>{formatDate(new Date(task.due_date))}</span>
              </div>
            )}
          </div>

          {/* Time Range - Not available in TaskItem */}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            {isEditing ? (
              <Select
                value={editedTask.piority}
                onValueChange={(value) => setEditedTask({ ...editedTask, piority: value as Piority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Flag className={`h-4 w-4 ${option.color}`} />
                        <span className={option.color}>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className={`p-3 rounded-md flex items-center gap-2 ${currentPriority?.bgColor}`}>
                <Flag className={`h-4 w-4 ${currentPriority?.color}`} />
                <span className={currentPriority?.color}>
                  {currentPriority?.label}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                if (onDeleteTask) {
                  onDeleteTask(task.id);
                }
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}