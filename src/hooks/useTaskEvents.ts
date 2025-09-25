import { useEffect } from 'react';
import { taskEvents } from '@/utils/taskEvents';
import { useTaskCounts } from '@/contexts/TaskContext';

// Custom hook to listen to task events and refresh counts
export function useTaskEvents() {
  const { invalidateTaskCounts } = useTaskCounts();

  useEffect(() => {
    console.log('Setting up task event listeners');

    const handleTaskChange = (event: CustomEvent) => {
      console.log('Task change detected:', event.type, event.detail);
      // Refresh counts whenever any task changes
      invalidateTaskCounts();
    };

    // Subscribe to all task events
    const cleanup = taskEvents.onAnyTaskChange(handleTaskChange);

    return () => {
      console.log('Cleaning up task event listeners');
      cleanup();
    };
  }, [invalidateTaskCounts]);
}

// Hook for components that need to know about specific task events
export function useTaskEventListeners() {
  const { invalidateTaskCounts } = useTaskCounts();

  const handleTaskCreated = (task: any) => {
    console.log('Task created, refreshing counts');
    invalidateTaskCounts();
  };

  const handleTaskUpdated = (taskId: string, changes: any, updatedTask: any) => {
    console.log('Task updated, refreshing counts');
    invalidateTaskCounts();
  };

  const handleTaskDeleted = (taskId: string, deletedTask: any) => {
    console.log('Task deleted, refreshing counts');
    invalidateTaskCounts();
  };

  const handleTaskCompleted = (taskId: string, completed: boolean, task: any) => {
    console.log('Task completion changed, refreshing counts');
    invalidateTaskCounts();
  };

  return {
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskCompleted
  };
}