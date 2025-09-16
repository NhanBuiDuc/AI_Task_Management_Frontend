import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  Flag, 
  Bell, 
  MoreHorizontal,
  Inbox,
  X 
} from 'lucide-react';


interface TaskFormProps {
  onSubmit?: (task: any) => void;
  onCancel?: () => void;
}

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState('');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-500' },
    { value: 'medium', label: 'Medium Priority', color: 'text-blue-500' },
    { value: 'high', label: 'High Priority', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-700' }
  ];

  const selectedPriority = priorityOptions.find(p => p.value === priority);
  const [inbox, setInbox] = useState('Inbox');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmit = () => {
    const task = {
      name: taskName,
      description,
      dueDate: selectedDate,
      priority,
      inbox
    };
    onSubmit?.(task);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Task Name Input */}
      <div className="mb-3">
        <Input
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="text-base border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400"
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400"
        />
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Date Button with Calendar Popup */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {selectedDate ? formatDate(selectedDate) : 'Today'}
              <X className="h-3 w-3 ml-2 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Priority Dropdown */}
        <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
              <Flag className={`h-4 w-4 mr-2 ${selectedPriority?.color || 'text-gray-500'}`} />
              {selectedPriority?.label || 'Priority'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <div className="space-y-1">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPriority(option.value);
                    setIsPriorityOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded-md text-left"
                >
                  <Flag className={`h-4 w-4 ${option.color}`} />
                  {option.label}
                </button>
              ))}
              {priority && (
                <button
                  onClick={() => {
                    setPriority('');
                    setIsPriorityOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded-md text-left text-gray-500"
                >
                  <Flag className="h-4 w-4 text-gray-300" />
                  No Priority
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Reminders Button */}
        <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
          <Bell className="h-4 w-4 mr-2" />
          Reminders
        </Button>

        {/* More Options Button */}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Inbox Selector */}
        <Select value={inbox} onValueChange={setInbox}>
          <SelectTrigger className="w-32 h-8 text-sm border-none shadow-none focus:ring-0">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-gray-500" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inbox">Inbox</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!taskName.trim()}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
}