import { api } from '@/lib/axios';

export interface Project {
  id: number;
  owner: string;
  name: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  createdAtTimestamp: number;
  addedAt: string;
}

export interface CreateProjectDto {
  path: string;
}

export class ProjectService {
  static async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects');
    return response.data;
  }

  // static async getProject(id: number): Promise<Project> {
  //   const response = await api.get(`/projects/${id}`);
  //   return response.data;
  // }

  static async addProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  }

  static async updateProject(id: number): Promise<Project> {
    const response = await api.put(`/projects/${id}`);
    return response.data;
  }

  static async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
}