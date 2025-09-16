import React, { useState } from 'react';
import { CalendarMainView } from '@/components/ui/calendar-main-view';

export type CalendarViewType = "month" | "week" | "day" | "agenda" | "multi-day" | "multi-week";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  isTask?: boolean;
  taskId?: string;
}

export function ComprehensiveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Team Meeting",
      start: new Date(2025, 8, 16, 10, 0),
      end: new Date(2025, 8, 16, 11, 0),
      color: "bg-blue-500",
    },
    {
      id: "2",
      title: "📋 Project Review",
      start: new Date(2025, 8, 17, 14, 0),
      end: new Date(2025, 8, 17, 15, 30),
      color: "bg-green-500",
      isTask: true,
      taskId: "task-1",
    },
    {
      id: "3",
      title: "Client Call",
      start: new Date(2025, 8, 18, 9, 0),
      end: new Date(2025, 8, 18, 10, 0),
      color: "bg-purple-500",
    },
  ]);

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

  const handleCreateTask = (date: Date, title: string) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: `📋 ${title}`,
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
      color: "bg-orange-500",
      isTask: true,
      taskId: `task-${Date.now()}`,
    };

    setEvents([...events, newEvent]);
  };

  const handleToggleTask = (taskId: string) => {
    console.log("Toggle task:", taskId);
    // Implement task toggle logic here
  };

  const handleUpdateTask = (taskId: string, updates: any) => {
    console.log("Update task:", taskId, updates);
    // Implement task update logic here
  };

  return (
    <div className="h-screen flex flex-col">
      <CalendarMainView
        events={events}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        viewType={viewType}
        onViewTypeChange={handleViewTypeChange}
        onNavigate={handleNavigate}
        onCreateTask={handleCreateTask}
        onToggleTask={handleToggleTask}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}