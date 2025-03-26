
/**
 * Implémentation de l'API des projets
 */

import { ProjectApi } from '@/types/api/domain';
import { Project } from '@/types/domain';
import { notionService } from '../notionService';

export class NotionProjectApi implements ProjectApi {
  async getProjects(): Promise<Project[]> {
    const response = await notionService.getProjects();
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des projets");
    }
    return response.data || [];
  }
  
  async getProjectById(id: string): Promise<Project> {
    const response = await notionService.getProjectById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Projet #${id} non trouvé`);
    }
    return response.data as Project;
  }
  
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await notionService.createProject(project);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création du projet");
    }
    return response.data as Project;
  }
  
  async updateProject(project: Project): Promise<Project> {
    const response = await notionService.updateProject(project.id, {
      name: project.name,
      url: project.url,
      description: project.description
    });
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour du projet");
    }
    return response.data as Project;
  }
  
  async deleteProject(id: string): Promise<boolean> {
    const response = await notionService.deleteProject(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression du projet");
    }
    return true;
  }
}

export const projectsApi = new NotionProjectApi();
