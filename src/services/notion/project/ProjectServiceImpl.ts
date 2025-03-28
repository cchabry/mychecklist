
/**
 * Implémentation standardisée du service de projets
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { CreateProjectInput, UpdateProjectInput } from './types';
import { StandardFilterOptions } from '../base/types';

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
    return this.mockGetProjects();
  }
  
  /**
   * Crée un projet fictif en mode mock
   */
  protected async mockCreate(data: CreateProjectInput): Promise<Project> {
    return this.mockCreateProject(data);
  }
  
  /**
   * Met à jour un projet fictif en mode mock
   */
  protected async mockUpdate(entity: UpdateProjectInput): Promise<Project> {
    return this.mockUpdateProject(entity);
  }
  
  /**
   * Implémentation de la récupération des projets
   */
  protected async getAllImpl(_options?: StandardFilterOptions<Project>): Promise<NotionResponse<Project[]>> {
    return this.getAllProjectsNotionImplementation();
  }
  
  /**
   * Implémentation de la récupération d'un projet par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<Project>> {
    return this.getProjectByIdNotionImplementation(id);
  }
  
  /**
   * Implémentation de la création d'un projet
   */
  protected async createImpl(data: CreateProjectInput): Promise<NotionResponse<Project>> {
    return this.createProjectNotionImplementation(data);
  }
  
  /**
   * Implémentation de la mise à jour d'un projet
   */
  protected async updateImpl(entity: UpdateProjectInput): Promise<NotionResponse<Project>> {
    return this.updateProjectNotionImplementation(entity);
  }
  
  /**
   * Implémentation de la suppression d'un projet
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    return this.deleteProjectNotionImplementation(id);
  }

  /**
   * Mock implementations
   */
  private mockGetProjects(): Project[] {
    return [
      {
        id: 'project-1',
        name: 'Site E-commerce',
        url: 'https://ecommerce.example.com',
        description: 'Refonte du site e-commerce',
        progress: 25,
        status: 'IN_PROGRESS',
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-01-20T14:30:00Z'
      },
      {
        id: 'project-2',
        name: 'Application mobile',
        url: 'https://mobile.example.com',
        description: 'Nouvelle application mobile',
        progress: 50,
        status: 'IN_PROGRESS',
        createdAt: '2023-02-01T09:15:00Z',
        updatedAt: '2023-02-10T16:45:00Z'
      }
    ];
  }

  private mockCreateProject(data: CreateProjectInput): Project {
    const now = new Date().toISOString();
    return {
      id: `project-${Date.now()}`,
      name: data.name,
      url: data.url || '',
      description: data.description || '',
      progress: data.progress || 0,
      status: data.status || 'NEW',
      createdAt: now,
      updatedAt: now
    };
  }

  private mockUpdateProject(entity: UpdateProjectInput): Project {
    const existingProject = this.mockGetProjects().find(p => p.id === entity.id);
    if (!existingProject) {
      throw new Error(`Project not found: ${entity.id}`);
    }
    
    return {
      ...existingProject,
      name: entity.name || existingProject.name,
      url: entity.url !== undefined ? entity.url : existingProject.url,
      description: entity.description !== undefined ? entity.description : existingProject.description,
      progress: entity.progress !== undefined ? entity.progress : existingProject.progress,
      status: entity.status || existingProject.status,
      updatedAt: new Date().toISOString()
    };
  }

  private getAllProjectsNotionImplementation(): Promise<NotionResponse<Project[]>> {
    // Cette méthode sera implémentée une fois l'API Notion correctement configurée
    return Promise.resolve({ 
      success: true, 
      data: this.mockGetProjects() 
    });
  }

  private getProjectByIdNotionImplementation(id: string): Promise<NotionResponse<Project>> {
    const project = this.mockGetProjects().find(p => p.id === id);
    
    if (!project) {
      return Promise.resolve({ 
        success: false, 
        error: { message: `Projet non trouvé: ${id}` } 
      });
    }
    
    return Promise.resolve({ success: true, data: project });
  }

  private createProjectNotionImplementation(data: CreateProjectInput): Promise<NotionResponse<Project>> {
    return Promise.resolve({ 
      success: true, 
      data: this.mockCreateProject(data) 
    });
  }

  private updateProjectNotionImplementation(entity: UpdateProjectInput): Promise<NotionResponse<Project>> {
    try {
      const project = this.mockUpdateProject(entity);
      return Promise.resolve({ success: true, data: project });
    } catch (error) {
      return Promise.resolve({ 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Erreur inconnue' } 
      });
    }
  }

  private deleteProjectNotionImplementation(id: string): Promise<NotionResponse<boolean>> {
    const exists = this.mockGetProjects().some(p => p.id === id);
    
    if (!exists) {
      return Promise.resolve({ 
        success: false, 
        error: { message: `Projet non trouvé: ${id}` } 
      });
    }
    
    return Promise.resolve({ success: true, data: true });
  }
}

// Créer et exporter une instance singleton
export const projectServiceImpl = new ProjectServiceImpl();

// Export par défaut
export default projectServiceImpl;
