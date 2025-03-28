
/**
 * Service pour la gestion des projets via Notion
 * 
 * Ce module fournit une implémentation du service de projets conforme
 * aux contrats définis dans les interfaces de service.
 */

import { BaseNotionService, CrudService, StandardFilterOptions } from '../base/BaseNotionService';
import { notionClient } from '../client/notionClient';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { CreateProjectData, UpdateProjectData } from '@/features/projects/types';
import { generateMockProjects } from './utils';

/**
 * Type pour les filtres de projets
 */
export interface ProjectFilters extends StandardFilterOptions {
  status?: string;
}

/**
 * Service de gestion des projets
 */
export class ProjectService extends BaseNotionService implements CrudService<Project, ProjectFilters, CreateProjectData, UpdateProjectData> {
  /**
   * Récupère tous les projets avec filtrage optionnel
   */
  async getAll(filters?: ProjectFilters): Promise<NotionResponse<Project[]>> {
    // Si en mode mock, renvoyer des données simulées
    if (this.isMockMode()) {
      return this.buildSuccessResponse(generateMockProjects(filters?.limit || 10));
    }
    
    return this.safeExecute(async () => {
      const config = this.getConfig();
      const databaseId = filters?.databaseId || config.projectsDbId;
      
      if (!databaseId) {
        throw new Error("ID de base de données des projets non configuré");
      }
      
      const response = await notionClient.post(`/databases/${databaseId}/query`, {
        filter: filters?.status ? {
          property: "status",
          select: {
            equals: filters.status
          }
        } : undefined,
        sorts: filters?.sortBy ? [
          {
            property: filters.sortBy,
            direction: filters.sortDirection || 'descending'
          }
        ] : undefined,
        page_size: filters?.limit || 100,
        start_cursor: filters?.startCursor
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || "Erreur lors de la récupération des projets");
      }
      
      // TODO: Implémenter le mapping des résultats Notion vers le format Project
      // Pour l'instant, simuler avec des données mock
      return generateMockProjects(filters?.limit || 10);
    }, "Erreur lors de la récupération des projets");
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getById(id: string): Promise<NotionResponse<Project>> {
    // Si en mode mock, générer un projet simulé
    if (this.isMockMode()) {
      const mockProjects = generateMockProjects(10);
      const project = mockProjects.find(p => p.id === id);
      
      if (!project) {
        return this.buildErrorResponse(`Projet #${id} non trouvé`);
      }
      
      return this.buildSuccessResponse(project);
    }
    
    return this.safeExecute(async () => {
      const response = await notionClient.get(`/pages/${id}`);
      
      if (!response.success) {
        throw new Error(response.error?.message || `Projet #${id} non trouvé`);
      }
      
      // TODO: Implémenter le mapping du résultat Notion vers le format Project
      // Pour l'instant, simuler avec un projet mock
      return {
        id,
        name: `Projet #${id}`,
        url: "https://example.com",
        description: "Description du projet",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }, `Erreur lors de la récupération du projet #${id}`);
  }
  
  /**
   * Crée un nouveau projet
   */
  async create(data: CreateProjectData): Promise<NotionResponse<Project>> {
    // Si en mode mock, simuler la création
    if (this.isMockMode()) {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: data.name,
        url: data.url || "",
        description: data.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return this.buildSuccessResponse(newProject);
    }
    
    return this.safeExecute(async () => {
      const config = this.getConfig();
      
      if (!config.projectsDbId) {
        throw new Error("ID de base de données des projets non configuré");
      }
      
      const response = await notionClient.post('/pages', {
        parent: { database_id: config.projectsDbId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: data.name
                }
              }
            ]
          },
          URL: {
            url: data.url || null
          },
          Description: {
            rich_text: data.description ? [
              {
                text: {
                  content: data.description
                }
              }
            ] : []
          }
        }
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || "Erreur lors de la création du projet");
      }
      
      // TODO: Implémenter le mapping du résultat Notion vers le format Project
      // Pour l'instant, simuler avec un projet mock
      return {
        id: response.data.id,
        name: data.name,
        url: data.url || "",
        description: data.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }, "Erreur lors de la création du projet");
  }
  
  /**
   * Met à jour un projet existant
   */
  async update(id: string, data: UpdateProjectData): Promise<NotionResponse<Project>> {
    // Si en mode mock, simuler la mise à jour
    if (this.isMockMode()) {
      return this.safeExecute(async () => {
        const projectResponse = await this.getById(id);
        
        if (!projectResponse.success || !projectResponse.data) {
          throw new Error(`Projet #${id} non trouvé`);
        }
        
        const updatedProject: Project = {
          ...projectResponse.data,
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        return updatedProject;
      }, `Erreur lors de la mise à jour du projet #${id}`);
    }
    
    return this.safeExecute(async () => {
      const properties: Record<string, any> = {};
      
      if (data.name !== undefined) {
        properties.Name = {
          title: [
            {
              text: {
                content: data.name
              }
            }
          ]
        };
      }
      
      if (data.url !== undefined) {
        properties.URL = {
          url: data.url || null
        };
      }
      
      if (data.description !== undefined) {
        properties.Description = {
          rich_text: data.description ? [
            {
              text: {
                content: data.description
              }
            }
          ] : []
        };
      }
      
      if (data.status !== undefined) {
        properties.Status = {
          select: {
            name: data.status
          }
        };
      }
      
      const response = await notionClient.patch(`/pages/${id}`, {
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet #${id}`);
      }
      
      // Récupérer le projet mis à jour
      const updatedProjectResponse = await this.getById(id);
      
      if (!updatedProjectResponse.success || !updatedProjectResponse.data) {
        throw new Error(`Erreur lors de la récupération du projet mis à jour #${id}`);
      }
      
      return updatedProjectResponse.data;
    }, `Erreur lors de la mise à jour du projet #${id}`);
  }
  
  /**
   * Supprime un projet
   */
  async delete(id: string): Promise<NotionResponse<boolean>> {
    // Si en mode mock, simuler la suppression
    if (this.isMockMode()) {
      return this.buildSuccessResponse(true);
    }
    
    return this.safeExecute(async () => {
      // Notion n'a pas d'API de suppression directe, donc on archive la page
      const response = await notionClient.patch(`/pages/${id}`, {
        archived: true
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || `Erreur lors de la suppression du projet #${id}`);
      }
      
      return true;
    }, `Erreur lors de la suppression du projet #${id}`);
  }
}

// Créer et exporter une instance singleton
export const projectService = new ProjectService();

// Export par défaut
export default projectService;
