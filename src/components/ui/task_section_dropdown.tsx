import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

// Section Component
export function SectionDropdown({ section, tasks, onToggleTask, onToggleSection, isExpanded }) {
  const taskCount = tasks.length;
  
  return (
    <div className="mb-4">
      {/* Section Header */}
      <div 
        className="flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-gray-50 rounded group"
        onClick={() => onToggleSection(section.id)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{section.name}</span>
          <span className="text-sm text-gray-500">{taskCount}</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      {/* Section Tasks */}
      {isExpanded && (
        <div className="ml-6 mt-2">
          {tasks.map((task, index) => (
            <div key={task.id}>
              <TaskCard
                task={task.text}
                completed={task.completed}
                onToggle={() => onToggleTask(task.id)}
                dueDate={task.dueDate}
              />
              {index < tasks.length - 1 && (
                <div className="border-b border-gray-200 my-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
