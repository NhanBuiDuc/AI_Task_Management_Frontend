import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Clock, X } from 'lucide-react';

interface TaskCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  title?: string;
  icon?: string;
}

export function TaskCreationForm({ isOpen, onClose, onSubmit, title = "Create Task", icon = "📋" }: TaskCreationFormProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(15);
  const [priority, setPriority] = useState('medium');
  const [repeat, setRepeat] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = () => {
    if (taskTitle.trim() && selectedDate) {
      const taskData = {
        name: taskTitle,
        due_date: selectedDate.toISOString().split('T')[0],
        reminder_date: `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`,
        duration_in_minutes: duration,
        piority: priority,
        repeat: repeat || undefined,
      };
      onSubmit(taskData);
      handleReset();
    }
  };

  const handleReset = () => {
    setTaskTitle('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    setDuration(15);
    setPriority('medium');
    setRepeat('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-gray-500' },
    { value: 'medium', label: 'Medium', color: 'text-blue-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-700' },
  ];

  const repeatOptions = [
    { value: '', label: 'No repeat' },
    { value: 'every day', label: 'Every day' },
    { value: 'every week', label: 'Every week' },
    { value: 'every month', label: 'Every month' },
    { value: 'every year', label: 'Every year' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Title */}
          <div>
            <Input
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date & Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date & Time
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {selectedDate ? `${formatDate(selectedDate)} ${selectedTime}` : 'Select date & time'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  <div className="mt-3 pt-3 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <div className="relative">
                      <Clock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => setIsCalendarOpen(false)}
                      size="sm"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="number"
                min="1"
                max="480"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                className="pl-10"
                placeholder="15"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Default: 15 minutes</p>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Repeat Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat
            </label>
            <Select value={repeat} onValueChange={setRepeat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {repeatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!taskTitle.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}