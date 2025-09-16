import React from 'react';
import { Button } from '@/components/ui/button';
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
  task: string;
  completed?: boolean;
  onToggle?: () => void;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
}

export function TaskCard({ task, completed = false, onToggle, dueDate }: TaskCardProps) {
  // Calculate date color based on due date
  const getDateColor = (dueDate?: string) => {
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
  const formatDate = (dueDate?: string) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full group">
      {/* Task item */}
      <div className="flex items-center gap-3 py-2">
        {/* Drag handle */}
        <Button variant="ghost" size="sm" className="p-1 cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </Button>

        {/* Checkbox */}
        <div
          className={`w-5 h-5 border-2 ${completed ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} rounded-full flex items-center justify-center hover:border-gray-400 cursor-pointer`}
          onClick={onToggle}
        >
          {completed && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>

        {/* Task text */}
        <div className="flex-1">
          <div className={`${completed ? 'text-gray-500 line-through' : 'text-black'} font-normal`}>
            {task}
          </div>
          {/* Calendar icon with date under task name */}
          {dueDate && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar className={`h-3 w-3 ${getDateColor(dueDate)}`} />
              <span className={`text-xs font-medium ${getDateColor(dueDate)}`}>
                {formatDate(dueDate)}
              </span>
            </div>
          )}
        </div>

        {/* Right side action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
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
  );
}