
/**
 * API Notion pour les projets
 * 
 * Ce module fournit l'implémentation de l'interface ProjectApi
 * pour accéder aux données de projets via l'API Notion ou en mode mock.
 */

import { ProjectApi } from '@/types/api/domain/projectApi';
import { projectService } from '../project';
import { Project } from '@/types/domain';
import { CreateProjectData, UpdateProjectData } from '@/types/api/domain/projectApi';
import { DELETE_ERROR, FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR } from '@/constants/errorMessages';
import { mapStringToProjectStatus } from '@/types/enums';

/**
 * Implémentation de l'API de projets utilisant le service Notion
 */
class NotionProjectApi implements ProjectApi {
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<Project[]> {
    const response = await projectService.getProjects();
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    const response = await projectService.getProjectById(id);
    
    if (!response.success) {
      return null;
    }
    
    return response.data || null;
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await projectService.createProject(data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    // Convertir le statut en ProjectStatus si défini
    const updatedData = {
      ...data,
      status: data.status ? mapStringToProjectStatus(data.status) : undefined
    };
    
    const response = await projectService.updateProject(id, updatedData);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<boolean> {
    const response = await projectService.deleteProject(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    
    return response.data ?? false;
  }
}

// Exporter une instance singleton
export const projectsApi = new NotionProjectApi();

// Export par défaut
export default projectsApi;
