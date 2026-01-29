import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskItem, Piority, ProjectItem, SectionItem, View } from '@/types';
import { projectApi } from '@/lib/api/project';
import { sectionApi } from '@/lib/api/section';
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';
import {
  CalendarDays,
  Flag,
  Bell,
  MoreHorizontal,
  Inbox,
  X,
  Clock,
  Repeat,
  Check,
  RotateCcw,
  Archive
} from 'lucide-react';


interface TaskFormProps {
  task?: TaskItem; // If provided, the form is in edit mode
  onSubmit?: (task: Partial<TaskItem>) => void;
  onCancel?: () => void;
  onToggleCompletion?: (taskId: string, completed: boolean) => void;
  onSendToCompleted?: (taskId: string) => void;
  defaultDate?: Date; // Default date for the due date picker (e.g., from calendar view)
  currentContext?: {
    view: 'inbox' | 'project' | 'today' | 'upcoming' | 'completed';
    projectId?: string;
    projectName?: string;
    sectionId?: string;
    sectionName?: string;
  };
}

export default function TaskForm({ task, onSubmit, onCancel, onToggleCompletion, onSendToCompleted, defaultDate, currentContext }: TaskFormProps) {
  const isEditMode = !!task;
  const [taskName, setTaskName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : (defaultDate || new Date())
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    task?.reminder_date ? new Date(task.reminder_date).toTimeString().slice(0, 5) : '09:00'
  );
  const [priority, setPriority] = useState<Piority | ''>(task?.piority || '');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    task?.reminder_date ? new Date(task.reminder_date) : undefined
  );
  const [reminderTime, setReminderTime] = useState<string>(
    task?.reminder_date ? new Date(task.reminder_date).toTimeString().slice(0, 5) : '09:00'
  );
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [duration, setDuration] = useState(task?.duration_in_minutes || 15);
  const [repeat, setRepeat] = useState<string>(task?.repeat || '');

  const priorityOptions: Array<{ value: Piority; label: string; color: string }> = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-500' },
    { value: 'medium', label: 'Medium Priority', color: 'text-blue-500' },
    { value: 'high', label: 'High Priority', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-700' }
  ];

  const repeatOptions = [
    { value: '', label: 'No repeat' },
    { value: 'every day', label: 'Every day' },
    { value: 'every week', label: 'Every week' },
    { value: 'every month', label: 'Every month' },
    { value: 'every year', label: 'Every year' },
  ];

  // Generate time options every 15 minutes
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  const selectedPriority = priorityOptions.find(p => p.value === priority);

  // Set default dropdown value based on current context
  const getDefaultInboxValue = () => {
    if (!currentContext) return 'Inbox';

    if (currentContext.view === 'inbox') return 'Inbox';
    if (currentContext.view === 'project') {
      // If we're in a specific section, use section ID; otherwise use project ID
      return currentContext.sectionId || currentContext.projectId || 'Inbox';
    }
    return 'Inbox';
  };

  const [inbox, setInbox] = useState(getDefaultInboxValue());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [sections, setSections] = useState<{ [key: string]: SectionItem[] }>({});
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load projects and their sections
  useEffect(() => {
    const loadProjectsAndSections = async () => {
      try {
        setLoadingProjects(true);
        const projectsData = await projectApi.getAllProjects();
        setProjects(projectsData);

        // Load sections for each project AND for Inbox
        const sectionsData: { [key: string]: SectionItem[] } = {};

        // Load Inbox sections (sections with project_id = null and current_view = "inbox")
        try {
          // Note: This might need a different API call for inbox sections
          // For now, we'll set empty array but this should be implemented
          sectionsData['Inbox'] = [];
        } catch (error) {
          sectionsData['Inbox'] = [];
        }

        // Load sections for each project
        for (const project of projectsData) {
          try {
            const projectSectionsResponse = await sectionApi.getSectionsByProject(project.id);
            // Extract results from paginated response
            const projectSections = projectSectionsResponse.results || projectSectionsResponse;
            sectionsData[project.id] = projectSections;
          } catch (error) {
            // If no sections found for a project, set empty array
            sectionsData[project.id] = [];
          }
        }
        setSections(sectionsData);
      } catch (error) {
        console.error('Failed to load projects and sections:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjectsAndSections();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmit = () => {
    // Combine date and time into a proper due_date string
    let dueDateString = '';
    if (selectedDate) {
      const combinedDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));
      dueDateString = combinedDateTime.toISOString().split('T')[0];
    }

    // Combine reminder date and time
    let reminderDateString = '';
    if (reminderDate) {
      const combinedReminderDateTime = new Date(reminderDate);
      const [reminderHours, reminderMinutes] = reminderTime.split(':');
      combinedReminderDateTime.setHours(parseInt(reminderHours), parseInt(reminderMinutes));
      reminderDateString = combinedReminderDateTime.toISOString().split('T')[0] + 'T' + reminderTime;
    }

    // Determine project_id and section_id based on 2-level tree selection
    let projectId: string | null = null;
    let sectionId: string | null = null;
    let currentView: View[] = ['inbox'];

    if (inbox === 'Inbox') {
      // Level 1 Selection: Inbox root (unsectioned)
      projectId = null;
      sectionId = null;
      currentView = ['inbox'];
    } else {
      // Check if selected value is a section
      const isSection = Object.values(sections).some(sectionList =>
        Array.isArray(sectionList) && sectionList.some(section => section.id === inbox)
      );

      if (isSection) {
        // Level 2 Selection: Find which project/inbox this section belongs to
        for (const [projId, sectionList] of Object.entries(sections)) {
          if (Array.isArray(sectionList)) {
            const section = sectionList.find(s => s.id === inbox);
            if (section) {
              if (projId === 'Inbox') {
                // Section belongs to Inbox (Level 2 under Inbox)
                projectId = null;
                sectionId = section.id;
                currentView = ['inbox'];
              } else {
                // Section belongs to a Project (Level 2 under Project)
                projectId = projId;
                sectionId = section.id;
                currentView = ['project'];
              }
              break;
            }
          }
        }
      } else {
        // Level 1 Selection: Project root (unsectioned)
        projectId = inbox;
        sectionId = null;
        currentView = ['project'];
      }
    }

    // Add additional views based on due date according to spec
    if (selectedDate) {
      const today = new Date();
      const dueDate = new Date(selectedDate);

      // Check if due date is today (same year, month, and day)
      if (dueDate.getFullYear() === today.getFullYear() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getDate() === today.getDate()) {
        if (!currentView.includes('today')) {
          currentView.push('today');
        }
      }

      // Check if due date falls in upcoming view (this week or next week)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)

      const endOfNextWeek = new Date(startOfWeek);
      endOfNextWeek.setDate(startOfWeek.getDate() + 13); // End of next week (Saturday)

      if (dueDate >= startOfWeek && dueDate <= endOfNextWeek && !currentView.includes('today')) {
        if (!currentView.includes('upcoming')) {
          currentView.push('upcoming');
        }
      }
    }

    const task: Partial<TaskItem> = {
      name: taskName,
      description: description || null,
      due_date: dueDateString,
      piority: priority || 'medium',
      completed: false,
      totally_completed: false,
      current_view: currentView,
      project_id: projectId,
      section_id: sectionId,
      reminder_date: reminderDateString || undefined,
      duration_in_minutes: duration,
      repeat: repeat || undefined
    };
    onSubmit?.(task);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <div className="w-full">
      {/* Task Name Input */}
      <div className="mb-3">
        <Input
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className={`text-base border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 ${selectedPriority?.color || 'text-gray-900'}`}
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 ${selectedPriority?.color || 'text-gray-900'}`}
        />
      </div>

      {/* Action Buttons - Row 1: Duration and Repeat */}
      <div className="flex items-center gap-2 mb-3">

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-3 text-sm w-[120px] justify-start ${
                duration !== 15
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : ''
              }`}
            >
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="8"
                    value={Math.floor(duration / 60)}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0;
                      const minutes = duration % 60;
                      setDuration(hours * 60 + minutes);
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
                    value={duration % 60}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0;
                      const hours = Math.floor(duration / 60);
                      setDuration(hours * 60 + minutes);
                    }}
                    className="text-center"
                    placeholder="00"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">minutes</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Default: 00 hours 15 minutes</p>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-3 text-sm w-[120px] justify-start ${
                repeat
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  : ''
              }`}
            >
              <Repeat className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {repeat ? repeatOptions.find(opt => opt.value === repeat)?.label || repeat : 'No repeat'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <div className="space-y-1">
              {repeatOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRepeat(option.value)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded-md text-left"
                >
                  <Repeat className="h-4 w-4 text-gray-500" />
                  {option.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

      </div>

      {/* Action Buttons - Row 2: Due date, Priority, Reminder */}
      <div className="flex items-center gap-2 mb-4">
        {/* Date Button with Calendar Popup */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100 w-[180px] justify-start"
            >
              <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {selectedDate ? `${formatDate(selectedDate)} ${selectedTime}` : 'Due date'}
              </span>
              {selectedDate && <X className="h-3 w-3 ml-2 opacity-50 flex-shrink-0" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
              <div className="border-t p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Due Time</span>
                </div>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => setIsCalendarOpen(false)}
                    className="flex-1"
                  >
                    Set Due Date
                  </Button>
                  {selectedDate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDate(undefined);
                        setIsCalendarOpen(false);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Priority Dropdown */}
        <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-3 text-sm ${selectedPriority?.color || 'text-gray-500'} border-current`}
            >
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

        {/* Reminders Button with Calendar + Time */}
        <Popover open={isReminderOpen} onOpenChange={setIsReminderOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-3 text-sm w-[160px] justify-start ${
                reminderDate
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                  : ''
              }`}
            >
              <Bell className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {reminderDate ? `${formatDate(reminderDate)} ${reminderTime}` : 'Reminders'}
              </span>
              {reminderDate && <X className="h-3 w-3 ml-2 opacity-50 flex-shrink-0" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col">
              <Calendar
                mode="single"
                selected={reminderDate}
                onSelect={(date) => {
                  setReminderDate(date);
                  if (!date) setIsReminderOpen(false);
                }}
                initialFocus
              />
              <div className="border-t p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Reminder Time</span>
                </div>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => setIsReminderOpen(false)}
                    className="flex-1"
                  >
                    Set Reminder
                  </Button>
                  {reminderDate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReminderDate(undefined);
                        setIsReminderOpen(false);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* More Options Button */}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Project/Section Selector */}
        <Select value={inbox} onValueChange={setInbox} disabled={loadingProjects}>
          <SelectTrigger className="w-40 h-8 text-sm border-none shadow-none focus:ring-0">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-gray-500" />
              <SelectValue placeholder={loadingProjects ? "Loading..." : "Select project"} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {/* Level 1: Inbox */}
            <SelectItem value="Inbox" className="font-semibold text-gray-900">
              📥 Inbox
            </SelectItem>
            {/* Level 2: Inbox Sections */}
            {sections['Inbox'] && sections['Inbox'].length > 0 &&
              sections['Inbox'].map((section) => (
                <SelectItem
                  key={section.id}
                  value={section.id}
                  className="pl-6 text-gray-600 text-sm"
                >
                  └ {section.name}
                </SelectItem>
              ))
            }

            {/* Level 1: Projects */}
            {projects.map((project) => (
              <React.Fragment key={project.id}>
                <SelectItem value={project.id} className="font-semibold text-gray-900 mt-1">
                  📁 {project.name}
                </SelectItem>
                {/* Level 2: Project Sections */}
                {sections[project.id] && sections[project.id].length > 0 &&
                  sections[project.id].map((section) => (
                    <SelectItem
                      key={section.id}
                      value={section.id}
                      className="pl-6 text-gray-600 text-sm"
                    >
                      └ {section.name}
                    </SelectItem>
                  ))
                }
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>

        {/* Completion Status Actions - Only in Edit Mode */}
        {isEditMode && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Task Status</h3>
            <div className="flex items-center gap-3">
              {/* State 1: Not Completed */}
              {!task?.completed && !task?.totally_completed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleCompletion?.(task.id, true)}
                  className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                  Set as completed
                </Button>
              )}

              {/* State 2: Completed (but not totally completed) */}
              {task?.completed && !task?.totally_completed && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleCompletion?.(task.id, false)}
                    className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Set as not completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendToCompleted?.(task.id)}
                    className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <Archive className="h-4 w-4" />
                    Send to completed list
                  </Button>
                </>
              )}

              {/* State 3: Totally Completed */}
              {task?.totally_completed && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Archive className="h-4 w-4" />
                  <span className="text-sm">Task is in completed list</span>
                </div>
              )}
            </div>
          </div>
        )}

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
            className={`text-white ${
              selectedPriority?.value === 'emergency' ? 'bg-red-700 hover:bg-red-800' :
              selectedPriority?.value === 'urgent' ? 'bg-red-500 hover:bg-red-600' :
              selectedPriority?.value === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
              selectedPriority?.value === 'medium' ? 'bg-blue-500 hover:bg-blue-600' :
              selectedPriority?.value === 'low' ? 'bg-gray-500 hover:bg-gray-600' :
              'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {isEditMode ? 'Update task' : 'Add task'}
          </Button>
        </div>
      </div>
    </div>
  );
}