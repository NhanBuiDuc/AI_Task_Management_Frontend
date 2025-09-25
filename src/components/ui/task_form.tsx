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
  Clock
} from 'lucide-react';


interface TaskFormProps {
  onSubmit?: (task: Partial<TaskItem>) => void;
  onCancel?: () => void;
  currentContext?: {
    view: 'inbox' | 'project' | 'today' | 'upcoming' | 'completed';
    projectId?: string;
    projectName?: string;
    sectionId?: string;
    sectionName?: string;
  };
}

export default function TaskForm({ onSubmit, onCancel, currentContext }: TaskFormProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [priority, setPriority] = useState<Piority | ''>('');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const priorityOptions: Array<{ value: Piority; label: string; color: string }> = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-500' },
    { value: 'medium', label: 'Medium Priority', color: 'text-blue-500' },
    { value: 'high', label: 'High Priority', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-700' }
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
      piority: priority || 'low',
      completed: false,
      totally_completed: false,
      current_view: currentView,
      project_id: projectId,
      section_id: sectionId,
      // Add reminder data (you may need to extend TaskItem interface to include reminder_date)
      reminder_date: reminderDateString || undefined
    };
    onSubmit?.(task);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6">
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

      {/* Action Buttons Row */}
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
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
}