import { taskApi } from './task';
import { taskEvents } from '@/utils/taskEvents';
import { TaskItem } from '@/types';

// Enhanced task API that emits events for real-time updates
export const enhancedTaskApi = {
  // Create task with event emission
  async createTask(taskData: Omit<TaskItem, 'id' | 'completed_date'>): Promise<TaskItem> {
    try {
      console.log('Creating task:', taskData);
      const createdTask = await taskApi.createTask(taskData);

      // Emit event for real-time updates
      taskEvents.emitTaskCreated(createdTask);

      return createdTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  // Update task with event emission
  async updateTask(taskId: string, updates: Partial<Pick<TaskItem, 'name' | 'description' | 'due_date' | 'piority'>>): Promise<TaskItem> {
    try {
      console.log('Updating task:', taskId, updates);
      const updatedTask = await taskApi.updateTask(taskId, updates);

      // Emit event for real-time updates
      taskEvents.emitTaskUpdated(taskId, updates, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  // Update task completion with event emission
  async updateTaskCompletion(taskId: string, completed: boolean): Promise<TaskItem> {
    try {
      console.log('Updating task completion:', taskId, completed);
      const updatedTask = await taskApi.updateTaskCompletion(taskId, completed);

      // Emit specific completion event
      taskEvents.emitTaskCompleted(taskId, completed, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task completion:', error);
      throw error;
    }
  },

  // Update task total completion with event emission
  async updateTaskTotalCompletion(taskId: string, totallyCompleted: boolean): Promise<TaskItem> {
    try {
      console.log('Updating task total completion:', taskId, totallyCompleted);
      const updatedTask = await taskApi.updateTaskTotalCompletion(taskId, totallyCompleted);

      // Emit completion event
      taskEvents.emitTaskCompleted(taskId, totallyCompleted, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task total completion:', error);
      throw error;
    }
  },

  // Delete task with event emission
  async deleteTask(taskId: string, taskToDelete?: TaskItem): Promise<void> {
    try {
      console.log('Deleting task:', taskId);

      // If task info not provided, try to get it first
      let deletedTask = taskToDelete;
      if (!deletedTask) {
        try {
          deletedTask = await taskApi.getTaskById(taskId);
        } catch (error) {
          console.warn('Could not fetch task before deletion:', error);
        }
      }

      await taskApi.deleteTask(taskId);

      // Emit event for real-time updates
      if (deletedTask) {
        taskEvents.emitTaskDeleted(taskId, deletedTask);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },

  // Move task to project with event emission
  async moveTaskToProject(taskId: string, targetProjectId: string): Promise<TaskItem> {
    try {
      console.log('Moving task to project:', taskId, targetProjectId);
      const updatedTask = await taskApi.moveTaskToProject(taskId, targetProjectId);

      // Emit update event
      taskEvents.emitTaskUpdated(taskId, { project_id: targetProjectId }, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to move task to project:', error);
      throw error;
    }
  },

  // Move task to section with event emission
  async moveTaskToSection(taskId: string, targetSectionId: string): Promise<TaskItem> {
    try {
      console.log('Moving task to section:', taskId, targetSectionId);
      const updatedTask = await taskApi.moveTaskToSection(taskId, targetSectionId);

      // Emit update event
      taskEvents.emitTaskUpdated(taskId, { section_id: targetSectionId }, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to move task to section:', error);
      throw error;
    }
  },

  // Make task unsectioned with event emission
  async makeTaskUnsectioned(taskId: string): Promise<TaskItem> {
    try {
      console.log('Making task unsectioned:', taskId);
      const updatedTask = await taskApi.makeTaskUnsectioned(taskId);

      // Emit update event
      taskEvents.emitTaskUpdated(taskId, { section_id: null }, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to make task unsectioned:', error);
      throw error;
    }
  },

  // Update task views with event emission
  async updateTaskViews(taskId: string, views: string[]): Promise<TaskItem> {
    try {
      console.log('Updating task views:', taskId, views);
      const updatedTask = await taskApi.updateTaskViews(taskId, views as any);

      // Emit update event
      taskEvents.emitTaskUpdated(taskId, { current_view: views }, updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task views:', error);
      throw error;
    }
  },

  // Create task in project with event emission
  async createTaskInProject(projectId: string, taskData: any): Promise<TaskItem> {
    try {
      console.log('Creating task in project:', projectId, taskData);
      const createdTask = await taskApi.createTaskInProject(projectId, taskData);

      // Emit event for real-time updates
      taskEvents.emitTaskCreated(createdTask);

      return createdTask;
    } catch (error) {
      console.error('Failed to create task in project:', error);
      throw error;
    }
  },

  // Create task in section with event emission
  async createTaskInSection(projectId: string, sectionId: string, taskData: any): Promise<TaskItem> {
    try {
      console.log('Creating task in section:', projectId, sectionId, taskData);
      const createdTask = await taskApi.createTaskInSection(projectId, sectionId, taskData);

      // Emit event for real-time updates
      taskEvents.emitTaskCreated(createdTask);

      return createdTask;
    } catch (error) {
      console.error('Failed to create task in section:', error);
      throw error;
    }
  },

  // Re-export read-only methods from original API
  getTasksByProject: taskApi.getTasksByProject,
  getOverdueTasks: taskApi.getOverdueTasks,
  getOverdueTasksByProject: taskApi.getOverdueTasksByProject,
  getTasksDueInDays: taskApi.getTasksDueInDays,
  getAllTasks: taskApi.getAllTasks,
  getTaskById: taskApi.getTaskById,
  getTasksByView: taskApi.getTasksByView,
  getTasksByPriority: taskApi.getTasksByPriority,
  getTasksByDueDate: taskApi.getTasksByDueDate,
  getCompletedTasks: taskApi.getCompletedTasks,
  getTaskCounts: taskApi.getTaskCounts
};