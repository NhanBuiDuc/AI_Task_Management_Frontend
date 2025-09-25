import { TaskItem } from '@/types';

// Task event types
export interface TaskCreatedEvent extends CustomEvent {
  detail: TaskItem;
}

export interface TaskUpdatedEvent extends CustomEvent {
  detail: {
    taskId: string;
    changes: Partial<TaskItem>;
    updatedTask: TaskItem;
  };
}

export interface TaskDeletedEvent extends CustomEvent {
  detail: {
    taskId: string;
    deletedTask: TaskItem;
  };
}

export interface TaskCompletedEvent extends CustomEvent {
  detail: {
    taskId: string;
    completed: boolean;
    task: TaskItem;
  };
}

// Task event emitter class
class TaskEventEmitter extends EventTarget {
  emitTaskCreated(task: TaskItem) {
    console.log('Emitting taskCreated event:', task);
    this.dispatchEvent(new CustomEvent('taskCreated', { detail: task }));
  }

  emitTaskUpdated(taskId: string, changes: Partial<TaskItem>, updatedTask: TaskItem) {
    console.log('Emitting taskUpdated event:', { taskId, changes, updatedTask });
    this.dispatchEvent(new CustomEvent('taskUpdated', {
      detail: { taskId, changes, updatedTask }
    }));
  }

  emitTaskDeleted(taskId: string, deletedTask: TaskItem) {
    console.log('Emitting taskDeleted event:', { taskId, deletedTask });
    this.dispatchEvent(new CustomEvent('taskDeleted', {
      detail: { taskId, deletedTask }
    }));
  }

  emitTaskCompleted(taskId: string, completed: boolean, task: TaskItem) {
    console.log('Emitting taskCompleted event:', { taskId, completed, task });
    this.dispatchEvent(new CustomEvent('taskCompleted', {
      detail: { taskId, completed, task }
    }));
  }

  onTaskCreated(callback: (event: TaskCreatedEvent) => void) {
    this.addEventListener('taskCreated', callback as EventListener);
  }

  onTaskUpdated(callback: (event: TaskUpdatedEvent) => void) {
    this.addEventListener('taskUpdated', callback as EventListener);
  }

  onTaskDeleted(callback: (event: TaskDeletedEvent) => void) {
    this.addEventListener('taskDeleted', callback as EventListener);
  }

  onTaskCompleted(callback: (event: TaskCompletedEvent) => void) {
    this.addEventListener('taskCompleted', callback as EventListener);
  }

  onAnyTaskChange(callback: (event: CustomEvent) => void) {
    const events = ['taskCreated', 'taskUpdated', 'taskDeleted', 'taskCompleted'];
    events.forEach(eventType => {
      this.addEventListener(eventType, callback as EventListener);
    });

    // Return cleanup function
    return () => {
      events.forEach(eventType => {
        this.removeEventListener(eventType, callback as EventListener);
      });
    };
  }
}

// Global task event emitter instance
export const taskEvents = new TaskEventEmitter();