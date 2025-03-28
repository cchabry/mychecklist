
/**
 * Façade pour le service de projets
 * 
 * Ce service fournit une interface simplifiée pour interagir avec les projets,
 * tout en utilisant l'implémentation standardisée sous-jacente.
 */

import { projectServiceImpl } from './ProjectServiceImpl';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { CreateProjectInput, UpdateProjectInput } from './types';

/**
 * Service de gestion des projets
 */
class ProjectService {
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    return projectServiceImpl.getAll();
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    return projectServiceImpl.getById(id);
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(data: CreateProjectInput): Promise<NotionResponse<Project>> {
    return projectServiceImpl.create(data);
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, data: Omit<UpdateProjectInput, 'id'>): Promise<NotionResponse<Project>> {
    return projectServiceImpl.update({ id, ...data });
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    return projectServiceImpl.delete(id);
  }
}

// Créer et exporter une instance singleton
export const projectService = new ProjectService();

// Export par défaut
export default projectService;

