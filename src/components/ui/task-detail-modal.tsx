import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Clock, Flag, Trash2, Edit, Check, X, Repeat, RotateCcw, Archive } from 'lucide-react';
import { TaskItem, Piority } from '@/types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleCompletion?: (taskId: string, completed: boolean) => void;
  onSendToCompleted?: (taskId: string) => void;
}

export function TaskDetailModal({ isOpen, onClose, task, onUpdateTask, onDeleteTask, onToggleCompletion, onSendToCompleted }: TaskDetailModalProps) {
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
        duration_in_minutes: editedTask.duration_in_minutes,
        repeat: editedTask.repeat === 'none' ? undefined : editedTask.repeat,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
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

  const repeatOptions = [
    { value: 'none', label: 'No repeat' },
    { value: 'every day', label: 'Every day' },
    { value: 'every week', label: 'Every week' },
    { value: 'every month', label: 'Every month' },
    { value: 'every year', label: 'Every year' },
  ];

  const currentRepeat = repeatOptions.find(r => r.value === (editedTask.repeat || 'none'));

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
                  <span className="ml-1">Edit</span>
                </Button>
              )}

              {/* Three-state completion system */}
              {/* State 1: Not Completed */}
              {!task.completed && !task.totally_completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleCompletion?.(task.id, true)}
                  className="text-gray-400 hover:text-green-600"
                >
                  <Check className="h-4 w-4" />
                  <span className="ml-1">Set as completed</span>
                </Button>
              )}

              {/* State 2: Completed (but not totally completed) */}
              {task.completed && !task.totally_completed && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleCompletion?.(task.id, false)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="ml-1">Set as not completed</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSendToCompleted?.(task.id)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Archive className="h-4 w-4" />
                    <span className="ml-1">Send to completed list</span>
                  </Button>
                </div>
              )}

              {/* State 3: Totally Completed */}
              {task.totally_completed && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Archive className="h-4 w-4" />
                  <span className="text-sm">Task is in completed list</span>
                </div>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            View and edit task details, including status, priority, due date, and other properties.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Status */}
          <div className={`p-3 rounded-lg ${
            task.totally_completed
              ? 'bg-gray-100 text-gray-800'
              : task.completed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                task.totally_completed
                  ? 'bg-gray-600'
                  : task.completed
                    ? 'bg-green-600'
                    : 'bg-yellow-600'
              }`}></div>
              <span className="font-medium">
                {task.totally_completed
                  ? 'In Completed List'
                  : task.completed
                    ? 'Completed'
                    : 'In Progress'
                }
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

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="8"
                    value={Math.floor((editedTask.duration_in_minutes || 15) / 60)}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0;
                      const minutes = (editedTask.duration_in_minutes || 15) % 60;
                      setEditedTask({
                        ...editedTask,
                        duration_in_minutes: hours * 60 + minutes
                      });
                    }}
                    className="text-center"
                    placeholder="00"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">hours</p>
                </div>
                <span className="text-gray-500 font-medium">:</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={(editedTask.duration_in_minutes || 15) % 60}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0;
                      const hours = Math.floor((editedTask.duration_in_minutes || 15) / 60);
                      setEditedTask({
                        ...editedTask,
                        duration_in_minutes: hours * 60 + minutes
                      });
                    }}
                    className="text-center"
                    placeholder="00"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">minutes</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {Math.floor((task.duration_in_minutes || 15) / 60).toString().padStart(2, '0')}:{((task.duration_in_minutes || 15) % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat
            </label>
            {isEditing ? (
              <Select
                value={editedTask.repeat || 'none'}
                onValueChange={(value) => setEditedTask({ ...editedTask, repeat: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No repeat" />
                </SelectTrigger>
                <SelectContent>
                  {repeatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-gray-500" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                <Repeat className="h-4 w-4 text-gray-500" />
                <span>{currentRepeat?.label || 'No repeat'}</span>
              </div>
            )}
          </div>

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