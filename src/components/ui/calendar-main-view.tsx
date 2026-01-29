"use client"
import TaskForm from "@/components/ui/task_form"
import { TaskDetailModal } from "./task-detail-modal"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, Flag } from "lucide-react"
import type { CalendarEvent, CalendarViewType } from "@/pages/ComprehensiveCalendar"
import type { TaskItem } from "@/types"
import { useState } from "react"
import { useTaskCompletion } from "@/hooks/useTaskCompletion"

// Priority utility functions (matching task_card.tsx)
const getPriorityFlagColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'text-priority-low';
    case 'medium': return 'text-priority-medium';
    case 'high': return 'text-priority-high';
    case 'urgent': return 'text-priority-urgent';
    case 'emergency': return 'text-priority-emergency';
    default: return 'text-gray-400';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    case 'urgent': return 'Urgent';
    case 'emergency': return 'Emergency';
    default: return 'None';
  }
};

interface CalendarViewProps {
  events: CalendarEvent[]
  tasks: TaskItem[]
  currentDate: Date
  onDateChange: (date: Date) => void
  viewType: CalendarViewType
  onViewTypeChange: (type: CalendarViewType) => void
  onNavigate: (direction: "prev" | "next") => void
  onCreateTask?: (date: Date, title: string) => void
  onToggleTask?: (id: string) => void
  onUpdateTask?: (id: string, updates: any) => void
  onDeleteTask?: (taskId: string) => void
  onToggleCompletion?: (taskId: string, completed: boolean) => void
  onSendToCompleted?: (taskId: string) => void
}

export function CalendarMainView({
  events,
  tasks,
  currentDate,
  onDateChange,
  viewType,
  onViewTypeChange,
  onNavigate,
  onCreateTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion,
  onSendToCompleted,
}: CalendarViewProps) {
  const [showTaskPanel, setShowTaskPanel] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)

  // Use the universal completion hook
  const { handleTaskCompletion, handleSendToCompleted } = useTaskCompletion({
    onUpdateTask: (taskId: string, updates: any) => {
      // Update task via the parent component's update handler
      if (onUpdateTask) {
        onUpdateTask(taskId, updates);
      }
    },
    onDataRefresh: undefined // Calendar handles refresh through other means
  })

  const handleTaskCreation = (taskData: any) => {
    if (taskData.name && taskData.name.trim() && taskData.due_date && onCreateTask) {
      const taskDate = new Date(taskData.due_date)
      onCreateTask(taskDate, taskData.name.trim())
      setShowTaskPanel(false)
    }
  }

  const openTaskPanel = () => {
    setShowTaskPanel(true)
  }

  const openTaskDetail = (event: CalendarEvent) => {
    if (event.isTask && event.taskId) {
      // Find the actual task from the tasks array
      const actualTask = tasks.find(task => task.id === event.taskId);

      if (actualTask) {
        setSelectedTask(actualTask);
        setShowTaskDetail(true);
      } else {
        console.warn(`Task with ID ${event.taskId} not found in tasks array`);
      }
    }
  }

  // Updated completion handler functions using universal hook
  const handleToggleCompletion = async (taskId: string, completed: boolean) => {
    if (selectedTask) {
      try {
        await handleTaskCompletion(selectedTask, completed, 'calendar' as any)
        // Update the selected task state to reflect the change
        setSelectedTask({ ...selectedTask, completed })
      } catch (error) {
        console.error('Error toggling completion in calendar:', error)
      }
    }
  }

  const handleSendToCompletedWrapper = async (taskId: string) => {
    if (selectedTask) {
      try {
        await handleSendToCompleted(selectedTask)
        // Update the selected task state to reflect the change
        setSelectedTask({ ...selectedTask, totally_completed: true })
      } catch (error) {
        console.error('Error sending to completed in calendar:', error)
      }
    }
  }

  const priorityOptions = [
    { value: 1, label: "Priority 1", color: "bg-red-500", textColor: "text-red-500" },
    { value: 2, label: "Priority 2", color: "bg-orange-500", textColor: "text-orange-500" },
    { value: 3, label: "Priority 3", color: "bg-blue-500", textColor: "text-blue-500" },
    { value: 4, label: "Priority 4", color: "bg-gray-500", textColor: "text-gray-500" },
  ]

  const repeatOptions = [
    { value: "none", label: "No repeat" },
    { value: "daily", label: "Every day" },
    { value: "weekly", label: "Every week on Friday" },
    { value: "weekdays", label: "Every weekday (Mon - Fri)" },
    { value: "monthly", label: "Every month on the 26th" },
    { value: "yearly", label: "Every year on September 26th" },
    { value: "custom", label: "Custom..." },
  ]

  const quickDateOptions = [
    { value: "today", label: "Today", day: "Mon" },
    { value: "tomorrow", label: "Tomorrow", day: "Tue" },
    { value: "weekend", label: "This weekend", day: "Sat" },
    { value: "next-week", label: "Next week", day: "Mon 8 Sep" },
    { value: "no-date", label: "No Date", day: "" },
  ]

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getHeaderTitle = () => {
    const year = currentDate.getFullYear()
    const month = monthNames[currentDate.getMonth()]

    switch (viewType) {
      case "day":
        return `${month} ${currentDate.getDate()}, ${year}`
      case "week":
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${month} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${year}`
        } else {
          return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${year}`
        }
      case "agenda":
        return `${month} ${year} - Agenda`
      case "multi-day":
        const multiDayStart = new Date(currentDate)
        multiDayStart.setDate(currentDate.getDate() - 1)
        const multiDayEnd = new Date(currentDate)
        multiDayEnd.setDate(currentDate.getDate() + 1)
        return `${monthNames[multiDayStart.getMonth()]} ${multiDayStart.getDate()}-${multiDayEnd.getDate()}, ${year}`
      case "multi-week":
        const multiWeekStart = new Date(currentDate)
        multiWeekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const multiWeekEnd = new Date(multiWeekStart)
        multiWeekEnd.setDate(multiWeekStart.getDate() + 13) // 2 weeks
        return `${monthNames[multiWeekStart.getMonth()]} ${multiWeekStart.getDate()} - ${monthNames[multiWeekEnd.getMonth()]} ${multiWeekEnd.getDate()}, ${year}`
      default:
        return `${month} ${year}`
    }
  }

  const generateCalendarDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)

    startDate.setDate(startDate.getDate() - startDate.getDay())
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDay = new Date(startDate)

    while (currentDay <= endDate) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }

  const generateMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)

    startDate.setDate(startDate.getDate() - startDate.getDay())
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDay = new Date(startDate)

    while (currentDay <= endDate) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour <= 23; hour++) {
      slots.push(hour)
    }
    return slots
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getEventStyle = (event: CalendarEvent) => {
    const startHour = event.start.getHours()
    const startMinute = event.start.getMinutes()
    const endHour = event.end.getHours()
    const endMinute = event.end.getMinutes()

    const startPosition = ((startHour - 7) * 60 + startMinute) / 60 // Hours from 7 AM
    const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 60 // Duration in hours

    return {
      top: `${startPosition * 4}rem`, // 4rem per hour
      height: `${duration * 4}rem`,
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const generateMultiDayDays = () => {
    const days = []
    for (let i = -1; i <= 1; i++) {
      const day = new Date(currentDate)
      day.setDate(currentDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const generateMultiWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let week = 0; week < 2; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(startOfWeek)
        currentDay.setDate(startOfWeek.getDate() + week * 7 + day)
        days.push(currentDay)
      }
    }
    return days
  }

  const getUpcomingEvents = () => {
    // Get start of current week (Sunday) based on currentDate
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Get end of next week (14 days from start of current week)
    const endOfRange = new Date(startOfWeek)
    endOfRange.setDate(startOfWeek.getDate() + 14)
    endOfRange.setHours(23, 59, 59, 999)

    return events
      .filter((event) => event.start >= startOfWeek && event.start <= endOfRange)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  const renderMonthView = () => {
    const days = generateMonthDays()

    return (
      <div className="flex-1 animate-in fade-in-50 duration-300">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonthDay = isCurrentMonth(day)
            const isTodayDay = isToday(day)

            return (
              <div
                key={index}
                className={`min-h-32 border-r border-b border-border p-2 transition-all duration-200 hover:bg-muted/30 cursor-pointer group ${
                  !isCurrentMonthDay ? "bg-muted/20" : "bg-background"
                } ${isTodayDay ? "ring-1 ring-primary/20" : ""}`}
                onClick={() => {
                  onDateChange(day)
                  onViewTypeChange("day")
                }}
              >
                <div
                  className={`text-sm font-medium mb-2 transition-all duration-200 ${
                    !isCurrentMonthDay
                      ? "text-muted-foreground"
                      : isTodayDay
                        ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                        : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate transition-all duration-200 hover:scale-105 hover:shadow-sm cursor-pointer ${event.color}`}
                      title={event.title}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (event.isTask && event.taskId) {
                          openTaskDetail(event)
                        } else if (onToggleTask) {
                          onToggleTask(event.taskId || event.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {event.start.getHours().toString().padStart(2, "0")}:
                        {event.start.getMinutes().toString().padStart(2, "0")} {event.title.replace("📋 ", "")}
                        {event.priority && (
                          <Flag className={`h-2 w-2 ${getPriorityFlagColor(event.priority)}`} />
                        )}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = generateWeekDays()
    const timeSlots = generateTimeSlots()
    const MAX_VISIBLE_PER_SLOT = 2

    return (
      <div className="flex-1 flex flex-col animate-in fade-in-50 duration-300">
        {/* Header with days */}
        <div className="flex border-b border-border bg-muted/30">
          <div className="w-16 flex-shrink-0 p-3"></div>
          {weekDays.map((day, index) => {
            const isTodayDay = isToday(day)
            return (
              <div
                key={index}
                className="flex-1 p-3 text-center transition-all duration-200 hover:bg-muted/40 cursor-pointer group"
                onClick={() => {
                  onDateChange(day)
                  onViewTypeChange("day")
                }}
              >
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {dayNames[day.getDay()]}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 transition-all duration-200 ${
                    isTodayDay
                      ? "bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow-sm"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-auto">
          <div className="flex min-h-full w-full">
            {/* Time column */}
            <div className="w-16 flex-shrink-0 border-r border-border bg-muted/10">
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 border-b border-border px-2 py-2 text-sm text-muted-foreground text-right">
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)

              // Group events by hour
              const eventsByHour = new Map<number, CalendarEvent[]>()
              dayEvents.forEach((event) => {
                const hour = event.start.getHours()
                if (!eventsByHour.has(hour)) {
                  eventsByHour.set(hour, [])
                }
                eventsByHour.get(hour)!.push(event)
              })

              return (
                <div key={dayIndex} className="flex-1 min-w-0 border-r border-border relative overflow-hidden">
                  {timeSlots.map((hour) => {
                    const hourEvents = eventsByHour.get(hour) || []
                    const visibleEvents = hourEvents.slice(0, MAX_VISIBLE_PER_SLOT)
                    const hiddenCount = hourEvents.length - MAX_VISIBLE_PER_SLOT

                    return (
                      <div key={hour} className="h-16 border-b border-border hover:bg-muted/10 transition-colors relative">
                        {visibleEvents.map((event, index) => (
                          <div
                            key={event.id}
                            className={`absolute ${event.color} text-white text-xs px-1 py-0.5 rounded shadow-sm cursor-pointer hover:shadow-md transition-all truncate`}
                            style={{
                              top: `${index * 28 + 2}px`,
                              left: '2px',
                              right: hiddenCount > 0 ? '36px' : '2px',
                              height: '24px',
                            }}
                            title={`${event.title} (${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, "0")} - ${event.end.getHours()}:${event.end.getMinutes().toString().padStart(2, "0")})`}
                            onClick={() => {
                              if (event.isTask && event.taskId) {
                                openTaskDetail(event)
                              } else if (onToggleTask) {
                                onToggleTask(event.taskId || event.id)
                              }
                            }}
                          >
                            <span className="truncate text-xs">{event.title.replace("📋 ", "")}</span>
                          </div>
                        ))}
                        {hiddenCount > 0 && (
                          <div
                            className="absolute right-0.5 top-0.5 bg-gray-600 text-white text-xs px-1 py-0.5 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                            style={{ height: '24px', fontSize: '10px' }}
                            onClick={() => {
                              onDateChange(day)
                              onViewTypeChange("agenda")
                            }}
                          >
                            +{hiddenCount}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const timeSlots = generateTimeSlots()
    const dayEvents = getEventsForDay(currentDate)
    const isTodayDay = isToday(currentDate)

    // Group events by start hour
    const eventsByHour = new Map<number, CalendarEvent[]>()
    dayEvents.forEach((event) => {
      const hour = event.start.getHours()
      if (!eventsByHour.has(hour)) {
        eventsByHour.set(hour, [])
      }
      eventsByHour.get(hour)!.push(event)
    })

    const MAX_VISIBLE_PER_SLOT = 2

    return (
      <div className="flex-1 flex flex-col animate-in fade-in-50 duration-300">
        <div className="border-b border-border p-4 bg-muted/20">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">{dayNames[currentDate.getDay()]}</div>
            <div
              className={`text-2xl font-semibold mt-1 transition-all duration-200 ${
                isTodayDay
                  ? "bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md"
                  : "text-foreground"
              }`}
            >
              {currentDate.getDate()}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex w-full">
            <div className="w-20 border-r border-border flex-shrink-0 bg-muted/10">
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 border-b border-border p-2 text-sm text-muted-foreground">
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            <div className="flex-1 min-w-0 relative overflow-hidden">
              {timeSlots.map((hour) => {
                const hourEvents = eventsByHour.get(hour) || []
                const visibleEvents = hourEvents.slice(0, MAX_VISIBLE_PER_SLOT)
                const hiddenCount = hourEvents.length - MAX_VISIBLE_PER_SLOT

                return (
                  <div key={hour} className="h-16 border-b border-border hover:bg-muted/10 transition-colors relative">
                    {visibleEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className={`absolute ${event.color} text-white text-xs px-2 py-1 rounded shadow-sm cursor-pointer hover:shadow-md transition-all truncate`}
                        style={{
                          top: `${index * 28 + 2}px`,
                          left: '4px',
                          right: hiddenCount > 0 ? '70px' : '4px',
                          height: '24px',
                        }}
                        title={`${event.title} (${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, "0")} - ${event.end.getHours()}:${event.end.getMinutes().toString().padStart(2, "0")})`}
                        onClick={() => {
                          if (event.isTask && event.taskId) {
                            openTaskDetail(event)
                          } else if (onToggleTask) {
                            onToggleTask(event.taskId || event.id)
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate">{event.title.replace("📋 ", "")}</span>
                          {event.priority && (
                            <Flag className={`h-2 w-2 flex-shrink-0 ${getPriorityFlagColor(event.priority)}`} />
                          )}
                        </div>
                      </div>
                    ))}
                    {hiddenCount > 0 && (
                      <div
                        className="absolute right-1 top-1 bg-gray-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                        style={{ height: '24px' }}
                        onClick={() => {
                          // Switch to agenda view for this day to see all events
                          onDateChange(currentDate)
                          onViewTypeChange("agenda")
                        }}
                      >
                        +{hiddenCount} more
                      </div>
                    )}
                  </div>
                )
              })}

              {dayEvents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium">No events today</p>
                    <p className="text-sm mt-1">Click the + button to add an event</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAgendaView = () => {
    const upcomingEvents = getUpcomingEvents()
    const eventsByDate = new Map<string, CalendarEvent[]>()

    upcomingEvents.forEach((event) => {
      const dateKey = event.start.toDateString()
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, [])
      }
      eventsByDate.get(dateKey)!.push(event)
    })

    return (
      <div className="flex-1 animate-in fade-in-50 duration-300 overflow-auto">
        <div className="p-6">
          {eventsByDate.size === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-muted-foreground">No upcoming events</p>
              <p className="text-sm text-muted-foreground mt-2">Your schedule is clear for the next week</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(eventsByDate.entries()).map(([dateString, dayEvents]) => {
                const date = new Date(dateString)
                const isTodayDate = isToday(date)

                return (
                  <div key={dateString} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-lg font-semibold transition-all duration-200 ${
                          isTodayDate
                            ? "bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm"
                            : "text-foreground"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="text-sm text-muted-foreground">{dayNames[date.getDay()]}</div>
                    </div>

                    <div className="ml-6 space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 cursor-pointer group"
                          onClick={() => {
                            if (event.isTask && event.taskId) {
                              openTaskDetail(event)
                            } else if (onToggleTask) {
                              onToggleTask(event.taskId || event.id)
                            }
                          }}
                        >
                          <div className="text-sm text-muted-foreground min-w-20">
                            {event.start.getHours().toString().padStart(2, "0")}:
                            {event.start.getMinutes().toString().padStart(2, "0")} -
                            {event.end.getHours().toString().padStart(2, "0")}:
                            {event.end.getMinutes().toString().padStart(2, "0")}
                          </div>
                          <div className={`w-3 h-3 rounded ${event.color} flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <div className="font-medium text-sm group-hover:text-primary transition-colors">
                                {event.title.replace("📋 ", "")}
                              </div>
                              {event.priority && (
                                <Flag className={`h-3 w-3 ${getPriorityFlagColor(event.priority)}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMultiDayView = () => {
    const multiDays = generateMultiDayDays()
    const timeSlots = generateTimeSlots()
    const MAX_VISIBLE_PER_SLOT = 2

    return (
      <div className="flex-1 flex flex-col animate-in fade-in-50 duration-300">
        {/* Header with days */}
        <div className="flex border-b border-border bg-muted/30">
          <div className="w-16 flex-shrink-0 p-3"></div>
          {multiDays.map((day, index) => {
            const isTodayDay = isToday(day)
            return (
              <div
                key={index}
                className="flex-1 p-3 text-center transition-all duration-200 hover:bg-muted/40 cursor-pointer group"
                onClick={() => {
                  onDateChange(day)
                  onViewTypeChange("day")
                }}
              >
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {dayNames[day.getDay()]}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 transition-all duration-200 ${
                    isTodayDay
                      ? "bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow-sm"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-auto">
          <div className="flex min-h-full w-full">
            {/* Time column */}
            <div className="w-16 flex-shrink-0 border-r border-border bg-muted/10">
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 border-b border-border px-2 py-2 text-sm text-muted-foreground text-right">
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {multiDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)

              // Group events by hour
              const eventsByHour = new Map<number, CalendarEvent[]>()
              dayEvents.forEach((event) => {
                const hour = event.start.getHours()
                if (!eventsByHour.has(hour)) {
                  eventsByHour.set(hour, [])
                }
                eventsByHour.get(hour)!.push(event)
              })

              return (
                <div key={dayIndex} className="flex-1 min-w-0 border-r border-border relative overflow-hidden">
                  {timeSlots.map((hour) => {
                    const hourEvents = eventsByHour.get(hour) || []
                    const visibleEvents = hourEvents.slice(0, MAX_VISIBLE_PER_SLOT)
                    const hiddenCount = hourEvents.length - MAX_VISIBLE_PER_SLOT

                    return (
                      <div key={hour} className="h-16 border-b border-border hover:bg-muted/10 transition-colors relative">
                        {visibleEvents.map((event, index) => (
                          <div
                            key={event.id}
                            className={`absolute ${event.color} text-white text-xs px-1 py-0.5 rounded shadow-sm cursor-pointer hover:shadow-md transition-all truncate`}
                            style={{
                              top: `${index * 28 + 2}px`,
                              left: '2px',
                              right: hiddenCount > 0 ? '36px' : '2px',
                              height: '24px',
                            }}
                            title={`${event.title} (${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, "0")} - ${event.end.getHours()}:${event.end.getMinutes().toString().padStart(2, "0")})`}
                            onClick={() => {
                              if (event.isTask && event.taskId) {
                                openTaskDetail(event)
                              } else if (onToggleTask) {
                                onToggleTask(event.taskId || event.id)
                              }
                            }}
                          >
                            <span className="truncate text-xs">{event.title.replace("📋 ", "")}</span>
                          </div>
                        ))}
                        {hiddenCount > 0 && (
                          <div
                            className="absolute right-0.5 top-0.5 bg-gray-600 text-white text-xs px-1 py-0.5 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                            style={{ height: '24px', fontSize: '10px' }}
                            onClick={() => {
                              onDateChange(day)
                              onViewTypeChange("agenda")
                            }}
                          >
                            +{hiddenCount}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderMultiWeekView = () => {
    const days = generateMultiWeekDays()

    return (
      <div className="flex-1 animate-in fade-in-50 duration-300">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isTodayDay = isToday(day)
            const weekIndex = Math.floor(index / 7)

            return (
              <div
                key={index}
                className={`min-h-32 border-r border-b border-border p-2 transition-all duration-200 hover:bg-muted/30 cursor-pointer group ${
                  weekIndex === 1 ? "bg-muted/10" : "bg-background"
                } ${isTodayDay ? "ring-1 ring-primary/20" : ""}`}
                onClick={() => {
                  onDateChange(day)
                  onViewTypeChange("day")
                }}
              >
                <div
                  className={`text-sm font-medium mb-2 transition-all duration-200 ${
                    isTodayDay
                      ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate transition-all duration-200 hover:scale-105 hover:shadow-sm cursor-pointer ${event.color}`}
                      title={event.title}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (event.isTask && event.taskId) {
                          openTaskDetail(event)
                        } else if (onToggleTask) {
                          onToggleTask(event.taskId || event.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {event.start.getHours().toString().padStart(2, "0")}:
                        {event.start.getMinutes().toString().padStart(2, "0")} {event.title.replace("📋 ", "")}
                        {event.priority && (
                          <Flag className={`h-2 w-2 ${getPriorityFlagColor(event.priority)}`} />
                        )}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative h-full overflow-hidden">
      <div className="flex-shrink-0 p-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-balance">{getHeaderTitle()}</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("prev")}
                className="hover:bg-muted/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("next")}
                className="hover:bg-muted/80 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-muted/80 transition-colors" onClick={openTaskPanel}>
              <Plus className="w-4 h-4" />
            </Button>
            <select
              value={viewType}
              onChange={(e) => onViewTypeChange(e.target.value as CalendarViewType)}
              className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all hover:bg-muted/50"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="agenda">Agenda</option>
              <option value="multi-day">3 Days</option>
              <option value="multi-week">2 Weeks</option>
            </select>
            <Button variant="ghost" size="sm" className="hover:bg-muted/80 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {showTaskPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Task</h2>
              <button
                onClick={() => setShowTaskPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <TaskForm
                onSubmit={handleTaskCreation}
                onCancel={() => setShowTaskPanel(false)}
                defaultDate={currentDate}
                currentContext={{
                  view: 'inbox'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <TaskDetailModal
        isOpen={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onUpdateTask={onUpdateTask || (() => {})}
        onDeleteTask={onDeleteTask}
        onToggleCompletion={onToggleCompletion || (() => {})}
        onSendToCompleted={onSendToCompleted || (() => {})}
      />

      <div className="flex-1 overflow-auto min-h-0">
        {viewType === "month" ? (
          renderMonthView()
        ) : viewType === "week" ? (
          renderWeekView()
        ) : viewType === "day" ? (
          renderDayView()
        ) : viewType === "agenda" ? (
          renderAgendaView()
        ) : viewType === "multi-day" ? (
          renderMultiDayView()
        ) : viewType === "multi-week" ? (
          renderMultiWeekView()
        ) : (
          <div className="flex-1 p-6 animate-in fade-in-50 duration-300">
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">{viewType} view coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                Currently showing {viewType} view for {getHeaderTitle()}
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Sample Events:</p>
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-2 justify-center">
                    <div className={`w-3 h-3 rounded ${event.color}`} />
                    <span className="text-sm">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 border-t border-border bg-card/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-center gap-2">
          {["Month", "Week", "Day", "Agenda", "Multi-Day", "Multi-Week"].map((view) => (
            <Button
              key={view}
              variant={viewType === view.toLowerCase() ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewTypeChange(view.toLowerCase() as CalendarViewType)}
              className="transition-all duration-200 hover:scale-105"
            >
              {view}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-105 shadow-sm"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  )
}
