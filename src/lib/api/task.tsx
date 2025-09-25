import { TaskItem, View, Piority } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Task API functions
export const taskApi = {
  // Create a task with custom project_id and section_id (for cross-project insertion)
  async createTask(taskData: Omit<TaskItem, 'id' | 'completed_date'>): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  // Insert tasks into a project
  async createTaskInProject(projectId: string, taskData: Omit<TaskItem, 'id' | 'project_id' | 'current_view' | 'completed_date'>): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...taskData, project_id: projectId }),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  // Insert tasks into a project within a section
  async createTaskInSection(projectId: string, sectionId: string, taskData: Omit<TaskItem, 'id' | 'project_id' | 'section_id' | 'current_view' | 'completed_date'>): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...taskData, project_id: projectId, section_id: sectionId }),
    });
    if (!response.ok) throw new Error('Failed to create task in section');
    return response.json();
  },

  // Get tasks within a project (sectioned and unsectioned)
  async getTasksByProject(projectId: string): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/?project_id=${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch project tasks');
    return response.json();
  },

  // Get overdue tasks (global)
  async getOverdueTasks(): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/overdue/`);
    if (!response.ok) throw new Error('Failed to fetch overdue tasks');
    return response.json();
  },

  // Get overdue tasks within a project
  async getOverdueTasksByProject(projectId: string): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/overdue/?project_id=${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch overdue tasks for project');
    return response.json();
  },

  // Get tasks due in X days
  async getTasksDueInDays(days: 3 | 7 | 14): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/due-in-days/?days=${days}`);
    if (!response.ok) throw new Error(`Failed to fetch tasks due in ${days} days`);
    return response.json();
  },

  // Move task to another project
  async moveTaskToProject(taskId: string, targetProjectId: string): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move_to_project/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_id: targetProjectId }),
    });
    if (!response.ok) throw new Error('Failed to move task to project');
    return response.json();
  },

  // Move task to another section
  async moveTaskToSection(taskId: string, targetSectionId: string): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move_to_section/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ section_id: targetSectionId }),
    });
    if (!response.ok) throw new Error('Failed to move task to section');
    return response.json();
  },

  // Make task unsectioned
  async makeTaskUnsectioned(taskId: string): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/make_unsectioned/`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to make task unsectioned');
    return response.json();
  },

  // Update task information
  async updateTask(taskId: string, updates: Partial<Pick<TaskItem, 'name' | 'description' | 'due_date' | 'piority'>>): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  // Update task completion status
  async updateTaskCompletion(taskId: string, completed: boolean): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/completion/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to update task completion');
    return response.json();
  },

  // Update task total completion status
  async updateTaskTotalCompletion(taskId: string, totallyCompleted: boolean): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/total_completion/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ totally_completed: totallyCompleted }),
    });
    if (!response.ok) throw new Error('Failed to update task total completion');
    return response.json();
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },

  // Update current view status
  async updateTaskViews(taskId: string, views: View[]): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/views/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ current_view: views }),
    });
    if (!response.ok) throw new Error('Failed to update task views');
    return response.json();
  },

  // Get tasks by view
  async getTasksByView(view: View): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/by_view/?view=${view}`);
    if (!response.ok) throw new Error('Failed to fetch tasks by view');
    return response.json();
  },

  // Get tasks by priority
  async getTasksByPriority(priority: Piority): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/by_priority/?priority=${priority}`);
    if (!response.ok) throw new Error('Failed to fetch tasks by priority');
    return response.json();
  },

  // Get all tasks
  async getAllTasks(): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/`);
    if (!response.ok) throw new Error('Failed to fetch all tasks');
    return response.json();
  },

  // Get task by ID
  async getTaskById(taskId: string): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`);
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  // Get tasks by due date (for Today view)
  async getTasksByDueDate(dueDate: string): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/by_due_date/?due_date=${dueDate}`);
    if (!response.ok) throw new Error('Failed to fetch tasks by due date');
    return response.json();
  },

  // Get completed tasks (for Completed page)
  async getCompletedTasks(projectId?: string, sectionId?: string): Promise<TaskItem[]> {
    let url = `${API_BASE_URL}/tasks/completed/`;
    const params = new URLSearchParams();

    if (projectId) {
      params.append('project_id', projectId);
    }
    if (sectionId) {
      params.append('section_id', sectionId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch completed tasks');
    return response.json();
  },

  // Get task counts for all navigation views
  async getTaskCounts(): Promise<{
    inbox: number;
    today: number;
    upcoming: number;
    completed: number;
    projects: {[projectId: string]: number};
  }> {
    // Get today's date in local timezone (same logic as Today page)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const response = await fetch(`${API_BASE_URL}/tasks/counts/?today_date=${todayString}`);
    if (!response.ok) throw new Error('Failed to fetch task counts');
    return response.json();
  },

  // Get tasks due in a date range (for Upcoming view)
  async getTasksDueInDateRange(startDate: string, endDate: string): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/by_date_range/?start_date=${startDate}&end_date=${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch tasks in date range');
    return response.json();
  },
};