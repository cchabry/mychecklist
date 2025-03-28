
/**
 * Service de projets
 * 
 * Ce service fournit des méthodes pour gérer les projets via l'API Notion
 */

import { NotionResponse } from '../base/types';
import { Project } from '@/types/domain';
import { generateMockProjects } from './utils';
import { BaseNotionService, StandardFilterOptions } from '../base';

/**
 * Service pour gérer les projets
 */
class ProjectService extends BaseNotionService<Project, Partial<Project>, Partial<Project>> {
  protected resourceName = 'Projet';
  protected databaseId = 'projectsDbId';

  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    return this.getAll();
  }
  
  /**
   * Génération de données mock pour les tests
   */
  protected generateMockData(_count: number, options?: StandardFilterOptions): Project[] {
    const projects = generateMockProjects();
    
    // Si des options de filtrage sont fournies, appliquer les filtres
    let filteredProjects = [...projects];
    
    if (options) {
      // Recherche textuelle
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredProjects = filteredProjects.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          (p.description && p.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Filtrage par statut
      if (options.status) {
        filteredProjects = filteredProjects.filter(p => p.status === options.status);
      }
    }
    
    return filteredProjects;
  }
  
  /**
   * Génération d'un item mock pour les tests
   */
  protected generateMockItem(id: string): Project | null {
    const mockProjects = generateMockProjects();
    const project = mockProjects.find(p => p.id === id);
    
    if (project) {
      return project;
    }
    
    return null;
  }
  
  /**
   * Crée une entité fictive en mode mock
   */
  protected async mockCreate(data: Partial<Project>): Promise<Project> {
    const now = new Date().toISOString();
    
    return {
      id: this.generateMockId('project'),
      name: data.name || 'Nouveau projet',
      url: data.url || 'https://example.com',
      description: data.description || '',
      createdAt: now,
      updatedAt: now,
      progress: data.progress || 0,
      status: data.status || 'active'
    };
  }
  
  /**
   * Met à jour une entité fictive en mode mock
   */
  protected async mockUpdate(entity: Project): Promise<Project> {
    return {
      ...entity,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Mapping d'une réponse Notion vers un modèle Project
   */
  protected mapNotionResponseToModel(responseData: any): Project {
    // Implémentation simplifiée
    return {
      id: responseData.id || '',
      name: responseData.properties?.Name?.title?.[0]?.plain_text || '',
      url: responseData.properties?.URL?.url || '',
      description: responseData.properties?.Description?.rich_text?.[0]?.plain_text || '',
      createdAt: responseData.created_time || new Date().toISOString(),
      updatedAt: responseData.last_edited_time || new Date().toISOString(),
      status: responseData.properties?.Status?.select?.name || 'active',
      progress: responseData.properties?.Progress?.number || 0,
    };
  }

  /**
   * Mapping d'un modèle Project vers un payload Notion
   */
  protected mapModelToNotionPayload(project: Partial<Project>): any {
    // Implémentation simplifiée
    return {
      properties: {
        Name: {
          title: [
            {
              type: 'text',
              text: { content: project.name || '' }
            }
          ]
        },
        ...(project.url && { URL: { url: project.url } }),
        ...(project.description && { 
          Description: { 
            rich_text: [{ type: 'text', text: { content: project.description } }] 
          } 
        }),
        ...(project.status && { Status: { select: { name: project.status } } }),
        ...(project.progress !== undefined && { Progress: { number: project.progress } })
      }
    };
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    return this.getById(id);
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    return this.create(projectData);
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(project: Project): Promise<NotionResponse<Project>> {
    return this.update(project);
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    return this.delete(id);
  }
  
  /**
   * Génération d'un ID mock
   */
  protected generateMockId(prefix = 'mock'): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

// Créer et exporter une instance singleton
export const projectService = new ProjectService();

// Export par défaut
export default projectService;
