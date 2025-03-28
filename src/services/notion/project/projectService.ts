
/**
 * Service de projets
 * 
 * Ce service fournit des méthodes pour gérer les projets via l'API Notion
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { generateMockProjects } from './utils';

/**
 * Service pour gérer les projets
 */
class ProjectService {
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    return this.getAll();
  }
  
  /**
   * Récupère tous les projets (nouvelle méthode normalisée)
   */
  async getAll(filter?: Record<string, any>): Promise<NotionResponse<Project[]>> {
    // Si en mode mock, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: generateMockProjects()
      };
    }
    
    // Récupérer la configuration
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return {
        success: false,
        error: {
          message: "Base de données des projets non configurée"
        }
      };
    }
    
    try {
      // En mode réel, nous interrogerions l'API Notion ici
      // Pour l'instant, utilisons quand même des données mock
      return {
        success: true,
        data: generateMockProjects()
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération des projets: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    return this.getById(id);
  }
  
  /**
   * Récupère un projet par son ID (nouvelle méthode normalisée)
   */
  async getById(id: string): Promise<NotionResponse<Project>> {
    // Si en mode mock, chercher dans les données simulées
    if (notionClient.isMockMode()) {
      const mockProjects = generateMockProjects();
      const project = mockProjects.find(p => p.id === id);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Projet avec l'ID ${id} non trouvé`
          }
        };
      }
      
      return {
        success: true,
        data: project
      };
    }
    
    // Récupérer la configuration
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return {
        success: false,
        error: {
          message: "Base de données des projets non configurée"
        }
      };
    }
    
    try {
      // En mode réel, nous interrogerions l'API Notion ici
      // Pour l'instant, simulons un projet
      const mockProjects = generateMockProjects();
      const project = mockProjects.find(p => p.id === id);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Projet avec l'ID ${id} non trouvé`
          }
        };
      }
      
      return {
        success: true,
        data: project
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    return this.create(projectData);
  }
  
  /**
   * Crée un nouveau projet (nouvelle méthode normalisée)
   */
  async create(projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    // Si en mode mock, créer un projet simulé
    if (notionClient.isMockMode()) {
      const now = new Date().toISOString();
      
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: projectData.name || 'Nouveau projet',
        url: projectData.url || 'https://example.com',
        description: projectData.description || '',
        createdAt: now,
        updatedAt: now,
        progress: 0
      };
      
      return {
        success: true,
        data: newProject
      };
    }
    
    // Récupérer la configuration
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return {
        success: false,
        error: {
          message: "Base de données des projets non configurée"
        }
      };
    }
    
    try {
      // En mode réel, nous interrogerions l'API Notion ici
      // Pour l'instant, simulons la création d'un projet
      const now = new Date().toISOString();
      
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: projectData.name || 'Nouveau projet',
        url: projectData.url || 'https://example.com',
        description: projectData.description || '',
        createdAt: now,
        updatedAt: now,
        progress: 0,
        ...(projectData.status && { status: projectData.status })
      };
      
      return {
        success: true,
        data: newProject
      };
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    return this.update(id, projectData);
  }
  
  /**
   * Met à jour un projet existant (nouvelle méthode normalisée)
   */
  async update(id: string, projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    // Si en mode mock, mettre à jour un projet simulé
    if (notionClient.isMockMode()) {
      // Chercher le projet dans les données simulées
      const mockProjects = generateMockProjects();
      const existingProject = mockProjects.find(p => p.id === id);
      
      if (!existingProject) {
        return {
          success: false,
          error: {
            message: `Projet avec l'ID ${id} non trouvé`
          }
        };
      }
      
      // Mettre à jour le projet
      const updatedProject: Project = {
        ...existingProject,
        ...projectData,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: updatedProject
      };
    }
    
    // Récupérer la configuration
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return {
        success: false,
        error: {
          message: "Base de données des projets non configurée"
        }
      };
    }
    
    try {
      // D'abord, récupérer le projet existant
      const existingProjectResponse = await this.getById(id);
      if (!existingProjectResponse.success) {
        return existingProjectResponse;
      }
      
      // Mettre à jour le projet
      const updatedProject: Project = {
        ...existingProjectResponse.data as Project,
        ...projectData,
        updatedAt: new Date().toISOString()
      };
      
      // En mode réel, nous mettrions à jour le projet dans Notion ici
      // Pour l'instant, simulons la mise à jour
      return {
        success: true,
        data: updatedProject
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    return this.delete(id);
  }
  
  /**
   * Supprime un projet (nouvelle méthode normalisée)
   */
  async delete(id: string): Promise<NotionResponse<boolean>> {
    // Si en mode mock, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // Récupérer la configuration
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return {
        success: false,
        error: {
          message: "Base de données des projets non configurée"
        }
      };
    }
    
    try {
      // En mode réel, nous supprimerions le projet dans Notion ici
      // Pour l'instant, simulons la suppression
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${id}:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
}

// Créer et exporter une instance singleton
export const projectService = new ProjectService();

// Export par défaut
export default projectService;
