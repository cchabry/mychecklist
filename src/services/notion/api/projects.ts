
/**
 * Implémentation de l'API des projets
 */

import { ProjectApi } from '@/types/api/domain';
import { Project } from '@/types/domain';
import { notionService } from '../notionService';
import { FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR, NOT_FOUND_ERROR } from '@/constants/errorMessages';

export class NotionProjectApi implements ProjectApi {
  async getProjects(): Promise<Project[]> {
    const response = await notionService.getProjects();
    if (!response.success) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    return response.data || [];
  }
  
  async getProjectById(id: string): Promise<Project> {
    const response = await notionService.getProjectById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `${NOT_FOUND_ERROR}: Projet #${id}`);
    }
    return response.data as Project;
  }
  
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await notionService.createProject(project);
    if (!response.success) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    return response.data as Project;
  }
  
  async updateProject(project: Project): Promise<Project> {
    const response = await notionService.updateProjectStd(project);
    if (!response.success) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    return response.data as Project;
  }
  
  async deleteProject(id: string): Promise<boolean> {
    const response = await notionService.deleteProject(id);
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    return true;
  }
}

export const projectsApi = new NotionProjectApi();
