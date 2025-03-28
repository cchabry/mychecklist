
/**
 * Service de projets
 * 
 * Ce service fournit des méthodes pour gérer les projets via l'API Notion
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { generateMockProjects } from './utils';
import { BaseNotionService, StandardFilterOptions } from '../base';

/**
 * Service pour gérer les projets
 */
class ProjectService extends BaseNotionService<Project, Partial<Project>, Partial<Project>> {
  constructor() {
    super('Projet', 'projectsDbId');
  }

  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    return this.getAll();
  }
  
  /**
   * Implémentation de la méthode pour générer des projets fictifs
   */
  protected async getMockEntities(options?: StandardFilterOptions): Promise<Project[]> {
    const projects = generateMockProjects();
    
    // Si des options de filtrage sont fournies, appliquer les filtres
    if (options) {
      // Exemple de filtrage basique à implémenter selon les besoins
      // Recherche textuelle
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        return projects.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          (p.description && p.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Filtrage par statut
      if (options.status) {
        return projects.filter(p => p.status === options.status);
      }
    }
    
    return projects;
  }
  
  /**
   * Crée une entité fictive en mode mock
   */
  protected async mockCreate(data: Partial<Project>): Promise<Project> {
    const now = new Date().toISOString();
    
    return {
      id: `project-${Date.now()}`,
      name: data.name || 'Nouveau projet',
      url: data.url || 'https://example.com',
      description: data.description || '',
      createdAt: now,
      updatedAt: now,
      progress: 0,
      ...(data.status && { status: data.status })
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
  async updateProject(id: string, projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    return this.update(id, projectData);
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    return this.delete(id);
  }
}

// Créer et exporter une instance singleton
export const projectService = new ProjectService();

// Export par défaut
export default projectService;
