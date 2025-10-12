import React, { useState, useEffect, useCallback } from 'react';
import { CalendarMainView } from '@/components/ui/calendar-main-view';
import { taskApi } from '@/lib/api/task';
import { TaskItem, Piority } from '@/types';
import { useTaskCounts } from '@/contexts/TaskContext';
import { useTaskCompletion } from '@/hooks/useTaskCompletion';

export type CalendarViewType = "month" | "week" | "day" | "agenda" | "multi-day" | "multi-week";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  isTask?: boolean;
  taskId?: string;
  priority?: string;
}

// Utility function to convert TaskItem to CalendarEvent
function convertTaskToEvent(task: TaskItem): CalendarEvent {
  // Parse the due date
  const dueDate = new Date(task.due_date);

  // If task has a reminder_date, use that as the start time, otherwise default to 9 AM
  let startTime: Date;
  if (task.reminder_date) {
    startTime = new Date(task.reminder_date);
  } else {
    // Default to 9 AM on the due date
    startTime = new Date(dueDate);
    startTime.setHours(9, 0, 0, 0);
  }

  // Calculate end time based on duration (default to 1 hour if not specified)
  const durationMinutes = task.duration_in_minutes || 60;
  const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));

  // Determine color based on priority and completion status
  let color = 'bg-blue-500'; // default
  if (task.completed) {
    color = 'bg-green-500'; // completed tasks
  } else if (task.totally_completed) {
    color = 'bg-gray-400'; // totally completed tasks
  } else {
    // Color by priority
    switch (task.piority) {
      case 'emergency':
        color = 'bg-red-600';
        break;
      case 'urgent':
        color = 'bg-red-500';
        break;
      case 'high':
        color = 'bg-orange-500';
        break;
      case 'medium':
        color = 'bg-yellow-500';
        break;
      case 'low':
        color = 'bg-blue-500';
        break;
      default:
        color = 'bg-gray-500';
    }
  }

  return {
    id: `task-${task.id}`,
    title: `📋 ${task.name}`,
    start: startTime,
    end: endTime,
    color,
    isTask: true,
    taskId: task.id,
    priority: task.piority, // Note: using the existing 'piority' field from TaskItem
  };
}

export function ComprehensiveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Use task context for real-time updates
  const { taskCounts, invalidateTaskCounts } = useTaskCounts();

  // Load tasks from API
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAllTasks();

      // Handle paginated response
      const allTasks = response.results || response;

      // Ensure allTasks is an array
      const tasksArray = Array.isArray(allTasks) ? allTasks : [];

      // Filter out totally completed tasks for calendar view
      const activeTasks = tasksArray.filter(task => !task.totally_completed);

      setTasks(activeTasks);

      // Convert tasks to calendar events
      const taskEvents = activeTasks.map(convertTaskToEvent);

      // Set only task events (no sample events)
      setEvents(taskEvents);
    } catch (error) {
      console.error('Failed to load tasks for calendar:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use universal completion hook for consistent task completion behavior
  const { handleTaskCompletion, handleSendToCompleted } = useTaskCompletion({
    onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => {
      // Update local tasks state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    },
    onDataRefresh: loadTasks
  });

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Reload tasks when task counts change (indicating task updates)
  useEffect(() => {
    if (!loading) {
      loadTasks();
    }
  }, [taskCounts, loadTasks]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewTypeChange = (type: CalendarViewType) => {
    setViewType(type);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (viewType) {
      case "month":
        newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "day":
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "agenda":
        newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "multi-day":
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 3 : -3));
        break;
      case "multi-week":
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 14 : -14));
        break;
    }

    setCurrentDate(newDate);
  };

  const handleCreateTask = async (date: Date, title: string) => {
    try {
      // Format the date for the task (using the selected date as due date)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dueDateString = `${year}-${month}-${day}`;

      // Create task data
      const taskData = {
        name: title,
        description: null,
        project_id: null, // Inbox task
        section_id: null,
        due_date: dueDateString,
        priority: 'medium' as Piority,
        duration_in_minutes: 60, // Default 1 hour
        reminder_date: date.toISOString(), // Use the selected time as reminder
      };

      // Create the task via API
      const newTask = await taskApi.createTask(taskData);

      // Convert to calendar event and add to events
      const newEvent = convertTaskToEvent(newTask);
      setEvents([...events, newEvent]);

      // Invalidate task counts to trigger refresh
      invalidateTaskCounts();

    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      // Skip sample events - they're not real tasks
      if (taskId.startsWith('sample-')) {
        console.log("Ignoring toggle for sample event:", taskId);
        return;
      }

      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error("Task not found:", taskId);
        return;
      }

      // Use universal completion hook for consistent behavior
      if (!task.completed) {
        // Mark as completed and move to appropriate section
        await handleTaskCompletion(task, true);
      } else {
        // Second click: Send to completed list (totally completed)
        await handleSendToCompleted(task);
      }

    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      // Skip sample events - they're not real tasks
      if (taskId.startsWith('sample-')) {
        console.log("Ignoring update for sample event:", taskId);
        return;
      }

      // Update the task via API
      const updatedTask = await taskApi.updateTask(taskId, updates);

      // Update local tasks state
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

      // Refresh events to reflect changes
      loadTasks();

      // Invalidate task counts to trigger refresh
      invalidateTaskCounts();

    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calendar events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <CalendarMainView
        events={events}
        tasks={tasks}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        viewType={viewType}
        onViewTypeChange={handleViewTypeChange}
        onNavigate={handleNavigate}
        onCreateTask={handleCreateTask}
        onToggleTask={handleToggleTask}
        onUpdateTask={handleUpdateTask}
        onToggleCompletion={(taskId: string, completed: boolean) => {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            handleTaskCompletion(task, completed);
          }
        }}
        onSendToCompleted={(taskId: string) => {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            handleSendToCompleted(task);
          }
        }}
      />
    </div>
  );
}

export default ComprehensiveCalendar;