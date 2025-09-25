import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  X,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Paperclip,
  CalendarDays,
  AlertTriangle,
  Flag,
  Tag,
  Bell,
  MapPin,
  Lock,
  Inbox,
  User
} from 'lucide-react';
import { TaskItem, ProjectItem, SectionItem, Piority } from '@/types';

interface TaskDetailFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  tasks: TaskItem[];
  projects: ProjectItem[];
  sections: SectionItem[];
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskDetailForm({
  isOpen,
  onClose,
  taskId,
  tasks,
  projects,
  sections,
  onUpdateTask,
  onDeleteTask
}: TaskDetailFormProps) {
  const [task, setTask] = useState<TaskItem | null>(null);
  const [editedTask, setEditedTask] = useState<TaskItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const foundTask = tasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setEditedTask({ ...foundTask });
      }
    }
  }, [taskId, tasks]);

  if (!isOpen || !task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onUpdateTask(task.id, {
        name: editedTask.name,
        description: editedTask.description,
        due_date: editedTask.due_date,
        piority: editedTask.piority,
        project_id: editedTask.project_id,
        section_id: editedTask.section_id,
      });
      setTask(editedTask);
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
    setTask({ ...task, completed: newCompleted });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && editedTask) {
      const isoString = date.toISOString().split('T')[0];
      setEditedTask({ ...editedTask, due_date: isoString });
    }
    setIsCalendarOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentProject = projects.find(p => p.id === task.project_id);
  const currentSection = sections.find(s => s.id === task.section_id);
  const availableSections = sections.filter(s => s.project_id === editedTask.project_id);

  const priorityOptions: { value: Piority; label: string; color: string }[] = [
    { value: 'emergency', label: 'Emergency', color: 'text-red-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'medium', label: 'Medium', color: 'text-blue-500' },
    { value: 'low', label: 'Low', color: 'text-gray-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {currentProject ? (
                <>
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: currentProject.color }}></div>
                  <span>{currentProject.name}</span>
                </>
              ) : (
                <>
                  <Inbox className="h-4 w-4" />
                  <span>Inbox</span>
                </>
              )}
              {currentSection && (
                <>
                  <span className="text-gray-400">/</span>
                  <span>{currentSection.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button variant="ghost" size="sm" className="p-1" onClick={() => setIsEditing(true)}>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="p-1" onClick={onClose}>
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Task Title */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-5 h-5 border-2 rounded-full flex items-center justify-center cursor-pointer mt-1 ${
                  task.completed ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}
                onClick={toggleCompleted}
              >
                {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editedTask.name}
                    onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                    className="text-lg font-medium border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                    placeholder="Task name"
                  />
                ) : (
                  <h2 className="text-lg font-medium">{task.name}</h2>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 ml-8">
              {isEditing ? (
                <Textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Description"
                  className="min-h-[80px] resize-none border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 bg-transparent"
                />
              ) : (
                <p className="text-gray-600">{task.description || 'No description'}</p>
              )}
            </div>

          {/* Add Sub-task */}
          <div className="ml-8 mb-8">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-700 px-0 h-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add sub-task
            </Button>
          </div>

          {/* Comment Section */}
          <div className="ml-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comment"
                  className="border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 bg-transparent"
                />
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <Paperclip className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l border-gray-200 p-6 space-y-6 bg-gray-50">
            {/* Project */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Project</label>
              {isEditing ? (
                <Select
                  value={editedTask.project_id || ''}
                  onValueChange={(value) => setEditedTask({ ...editedTask, project_id: value || null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Inbox</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: project.color }}></div>
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  {currentProject ? (
                    <>
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: currentProject.color }}></div>
                      <span className="text-sm text-gray-700">{currentProject.name}</span>
                    </>
                  ) : (
                    <>
                      <Inbox className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Inbox</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Section */}
            {(isEditing && editedTask.project_id) || (!isEditing && currentSection) ? (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Section</label>
                {isEditing ? (
                  <Select
                    value={editedTask.section_id || ''}
                    onValueChange={(value) => setEditedTask({ ...editedTask, section_id: value || null })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No section</SelectItem>
                      {availableSections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{currentSection?.name || 'No section'}</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Due Date */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                {isEditing && (
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedTask.due_date ? new Date(editedTask.due_date) : undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{formatDate(task.due_date)}</span>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Priority</label>
              {isEditing ? (
                <Select
                  value={editedTask.piority}
                  onValueChange={(value) => setEditedTask({ ...editedTask, piority: value as Piority })}
                >
                  <SelectTrigger className="w-full">
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
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <Flag className={`h-4 w-4 ${priorityOptions.find(p => p.value === task.piority)?.color}`} />
                  <span className={`text-sm font-medium ${priorityOptions.find(p => p.value === task.piority)?.color}`}>
                    {priorityOptions.find(p => p.value === task.piority)?.label}
                  </span>
                </div>
              )}
            </div>

            {/* Reminder Date */}
            {task.reminder_date && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Reminder</label>
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{formatDate(task.reminder_date)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                    Edit Task
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDeleteTask(task.id);
                      onClose();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}