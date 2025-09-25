import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { taskApi } from '@/lib/api/task';

interface TaskCounts {
  inbox: number;
  today: number;
  upcoming: number;
  completed: number;
  projects: {[projectId: string]: number};
}

interface TaskContextType {
  taskCounts: TaskCounts;
  refreshTaskCounts: () => Promise<void>;
  invalidateTaskCounts: () => void;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    inbox: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    projects: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshTaskCounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const counts = await taskApi.getTaskCounts();
      setTaskCounts(counts);
      console.log('Task counts refreshed:', counts);
    } catch (error) {
      console.error('Failed to refresh task counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateTaskCounts = useCallback(() => {
    console.log('Task counts invalidated - triggering refresh');
    refreshTaskCounts(); // Trigger refresh
  }, [refreshTaskCounts]);

  const connectWebSocket = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      // Connect to WebSocket (adjust URL based on your Django server)
      const ws = new WebSocket('ws://localhost:8000/ws/task-counts/');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for real-time task count updates');
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'task_count_update' && message.data) {
            console.log('Real-time task count update received:', message.data);
            setTaskCounts(message.data);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds if not intentionally closed
        if (event.code !== 1000) { // 1000 is normal closure
          console.log('Attempting to reconnect WebSocket in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Fallback to API refresh
      refreshTaskCounts();
    }
  }, [refreshTaskCounts]);

  // Load initial task counts and setup WebSocket
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const value = {
    taskCounts,
    refreshTaskCounts,
    invalidateTaskCounts,
    isLoading
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskCounts() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskCounts must be used within TaskProvider');
  }
  return context;
}