import { ProjectItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Project API functions
export const projectApi = {
  // Insert new project
  async createProject(projectData: Omit<ProjectItem, 'id' | 'taskCount' | 'hasChildren'>): Promise<ProjectItem> {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  // Check if project name is duplicated (project name is unique)
  async checkProjectNameExists(name: string, parentId?: string): Promise<boolean> {
    const params = new URLSearchParams({ name });
    if (parentId) params.append('parent_id', parentId);

    const response = await fetch(`${API_BASE_URL}/projects/check_name/?${params}`);
    if (!response.ok) throw new Error('Failed to check project name');
    const { exists } = await response.json();
    return exists;
  },

  // Get all projects
  async getAllProjects(): Promise<ProjectItem[]> {
    const response = await fetch(`${API_BASE_URL}/projects/`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data = await response.json();
    // Django REST framework returns paginated response, extract results
    return data.results || data;
  },

  // Get project by id
  async getProjectById(id: string): Promise<ProjectItem> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  // Check if project is independent (Not be children and not has children)
  async isProjectIndependent(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/independent/`);
    if (!response.ok) throw new Error('Failed to check project independence');
    const { independent } = await response.json();
    return independent;
  },

  // Count tasks from project
  async getProjectTaskCount(id: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/task_count/`);
    if (!response.ok) throw new Error('Failed to get task count');
    const { count } = await response.json();
    return count;
  },

  // Get all sub projects (as object project list)
  async getSubProjects(parentId: string): Promise<ProjectItem[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${parentId}/children/`);
    if (!response.ok) throw new Error('Failed to fetch sub projects');
    return response.json();
  },

  // Delete project (cascade delete)
  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },

  // Update project name
  async updateProjectName(id: string, name: string): Promise<ProjectItem> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update project name');
    return response.json();
  },

  // Update project (general update for any field)
  async updateProject(id: string, updates: Partial<Omit<ProjectItem, 'id' | 'taskCount' | 'hasChildren'>>): Promise<ProjectItem> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  // Update project to become child of another project
  async moveProjectToParent(id: string, parentId: string): Promise<ProjectItem> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/move/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent_id: parentId }),
    });
    if (!response.ok) throw new Error('Failed to move project');
    return response.json();
  },

  // Update project to become independent
  async makeProjectIndependent(id: string): Promise<ProjectItem> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/make_independent/`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to make project independent');
    return response.json();
  },
};