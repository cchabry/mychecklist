
/**
 * Implémentation standardisée du service de projets
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { CreateProjectInput, UpdateProjectInput } from './types';
import { StandardFilterOptions } from '../base/types';
import {
  getAllProjectsNotionImplementation,
  getProjectByIdNotionImplementation,
  createProjectNotionImplementation,
  updateProjectNotionImplementation,
  deleteProjectNotionImplementation,
  mockGetProjects,
  mockCreateProject,
  mockUpdateProject
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
    return mockGetProjects();
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
  protected async getAllImpl(_options?: StandardFilterOptions<Project>): Promise<NotionResponse<Project[]>> {
    return getAllProjectsNotionImplementation();
  }
  
  /**
   * Implémentation de la récupération d'un projet par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<Project>> {
    return getProjectByIdNotionImplementation(id);
  }
  
  /**
   * Implémentation de la création d'un projet
   */
  protected async createImpl(data: CreateProjectInput): Promise<NotionResponse<Project>> {
    return createProjectNotionImplementation(data);
  }
  
  /**
   * Implémentation de la mise à jour d'un projet
   */
  protected async updateImpl(entity: UpdateProjectInput): Promise<NotionResponse<Project>> {
    return updateProjectNotionImplementation(entity);
  }
  
  /**
   * Implémentation de la suppression d'un projet
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    return deleteProjectNotionImplementation(id);
  }
}

// Créer et exporter une instance singleton
export const projectServiceImpl = new ProjectServiceImpl();

// Export par défaut
export default projectServiceImpl;
