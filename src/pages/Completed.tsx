import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskItem, ProjectItem } from '@/types';
import { taskApi } from '@/lib/api/task';
import { projectApi } from '@/lib/api/project';
import {
  ChevronDown,
  User,
  Check,
  CheckSquare,
  Inbox
} from 'lucide-react';

interface ActivityDay {
  date: string;
  dayName: string;
  tasks: TaskItem[];
}

function Completed() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects and completed tasks
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all projects
        const projectsData = await projectApi.getAllProjects();
        setProjects(projectsData);

        // Load all totally completed tasks
        await loadCompletedTasks();
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load completed tasks');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load completed tasks based on filter
  const loadCompletedTasks = async () => {
    try {
      console.log('DEBUG: Loading completed tasks...');
      // Use the new dedicated endpoint for completed tasks
      const completed = await taskApi.getCompletedTasks();
      console.log('DEBUG: Loaded completed tasks:', completed);
      setCompletedTasks(completed);
    } catch (error) {
      console.error('Failed to load completed tasks:', error);
      setError('Failed to load completed tasks');
    }
  };

  // Filter tasks based on selected filter
  const getFilteredTasks = (): TaskItem[] => {
    if (selectedFilter === 'all') {
      return completedTasks;
    }
    if (selectedFilter === 'Inbox') {
      return completedTasks.filter(task => task.project_id === null);
    }

    // Check if it's a project ID
    const isProjectId = projects.some(project => project.id === selectedFilter);
    if (isProjectId) {
      return completedTasks.filter(task => task.project_id === selectedFilter);
    }

    return completedTasks;
  };

  // Group filtered tasks by completion date
  const groupTasksByDate = (tasks: TaskItem[]): ActivityDay[] => {
    const grouped: { [key: string]: TaskItem[] } = {};

    tasks.forEach(task => {
      if (task.completed_date) {
        const date = new Date(task.completed_date);
        const dateKey = date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short'
        });
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const fullKey = `${dateKey} · ${dayName}`;

        if (!grouped[fullKey]) {
          grouped[fullKey] = [];
        }
        grouped[fullKey].push(task);
      }
    });

    // Convert to ActivityDay format and sort by date (newest first)
    return Object.entries(grouped)
      .map(([dateKey, tasks]) => {
        const [datePart] = dateKey.split(' · ');
        const [dayPart] = dateKey.split(' · ').slice(1);
        return {
          date: datePart,
          dayName: dayPart,
          tasks: tasks.sort((a, b) => new Date(b.completed_date!).getTime() - new Date(a.completed_date!).getTime())
        };
      })
      .sort((a, b) => {
        // Parse dates for proper sorting
        const dateA = new Date(`${a.date} 2025`); // Assuming current year
        const dateB = new Date(`${b.date} 2025`);
        return dateB.getTime() - dateA.getTime();
      });
  };

  // Get project tag for a task (project level only)
  const getTaskTag = (task: TaskItem): { text: string; icon: string } => {
    if (task.project_id) {
      const project = projects.find(p => p.id === task.project_id);
      return {
        text: project?.name || 'Project',
        icon: '#'
      };
    } else {
      return {
        text: 'Inbox',
        icon: '#'
      };
    }
  };

  // Format completion time
  const formatCompletionTime = (completedDate: string): string => {
    const date = new Date(completedDate);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const filteredTasks = getFilteredTasks();
  const activityData = groupTasksByDate(filteredTasks);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Activity:</h1>
          <Select value={selectedFilter} onValueChange={setSelectedFilter} disabled={loading}>
            <SelectTrigger className="w-40 border-none shadow-none text-2xl font-semibold p-0 h-auto focus:ring-0">
              <SelectValue />
              <ChevronDown className="h-5 w-5 ml-2" />
            </SelectTrigger>
            <SelectContent>
              {/* All Projects option */}
              <SelectItem value="all" className="font-semibold text-gray-900">
                All Projects
              </SelectItem>

              {/* Inbox option */}
              <SelectItem value="Inbox" className="font-semibold text-gray-900">
                📥 Inbox
              </SelectItem>

              {/* Individual Projects */}
              {projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  className="font-semibold text-gray-900"
                >
                  📁 {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="flex items-center gap-2 text-gray-900">
            <CheckSquare className="h-4 w-4" />
            <span>Completed tasks</span>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading completed tasks...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && activityData.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">No completed tasks found</div>
        </div>
      )}

      {/* Activity Timeline */}
      {!loading && !error && activityData.length > 0 && (
        <div className="space-y-8">
          {activityData.map((day, dayIndex) => (
            <div key={`${day.date}-${day.dayName}`} className="space-y-4">
              {/* Date Header */}
              <h2 className="text-lg font-medium text-gray-800">
                {day.date} · {day.dayName}
              </h2>

              {/* Tasks for this day */}
              <div className="space-y-4">
                {day.tasks.map((task) => {
                  const taskTag = getTaskTag(task);
                  return (
                    <div key={task.id} className="flex items-center gap-4 py-2">
                      {/* Avatar with checkmark */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Activity text */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-900 font-medium">You</span>
                          <span className="text-gray-600">completed a task:</span>
                          <button className="text-gray-900 font-medium underline hover:no-underline">
                            {task.name}
                          </button>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {task.completed_date && formatCompletionTime(task.completed_date)}
                        </div>
                      </div>

                      {/* Project/Section tag */}
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        <span>{taskTag.text}</span>
                        <span className="text-yellow-600">{taskTag.icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Completed;