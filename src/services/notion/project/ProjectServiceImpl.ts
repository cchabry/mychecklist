
/**
 * Implémentation standardisée du service de projets
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { CreateProjectInput, UpdateProjectInput } from './types';
import { 
  getMockProjects, 
  mockCreateProject, 
  mockUpdateProject 
} from './mockImplementations';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from './apiImplementations';

/**
 * Implémentation standardisée du service de projets
 */
export class ProjectServiceImpl extends BaseNotionService<Project, CreateProjectInput, UpdateProjectInput> {
  constructor() {
    super('Projet', 'projectsDbId');
  }
  
  /**
   * Génère des projets fictifs pour le mode mock
   */
  protected async getMockEntities(): Promise<Project[]> {
    return getMockProjects();
  }
  
  /**
   * Crée un projet fictif en mode mock
   */
  protected async mockCreate(data: CreateProjectInput): Promise<Project> {
    return mockCreateProject(data);
  }
  
  /**
   * Met à jour un projet fictif en mode mock
   */
  protected async mockUpdate(entity: UpdateProjectInput): Promise<Project> {
    return mockUpdateProject(entity);
  }
  
  /**
   * Implémentation de la récupération des projets
   */
  protected async getAllImpl(): Promise<NotionResponse<Project[]>> {
    return getAllProjects();
  }
  
  /**
   * Implémentation de la récupération d'un projet par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<Project>> {
    return getProjectById(id);
  }
  
  /**
   * Implémentation de la création d'un projet
   */
  protected async createImpl(data: CreateProjectInput): Promise<NotionResponse<Project>> {
    return createProject(data);
  }
  
  /**
   * Implémentation de la mise à jour d'un projet
   */
  protected async updateImpl(entity: UpdateProjectInput): Promise<NotionResponse<Project>> {
    return updateProject(entity);
  }
  
  /**
   * Implémentation de la suppression d'un projet
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    return deleteProject(id);
  }
}

// Créer et exporter une instance singleton
export const projectServiceImpl = new ProjectServiceImpl();

// Export par défaut
export default projectServiceImpl;
