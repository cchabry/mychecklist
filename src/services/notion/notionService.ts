
/**
 * Service principal pour l'API Notion
 */

import { Project, ProjectStatus } from '@/types/domain';
import { NotionClient } from './notionClient';
import { NotionResponse, NotionConfig, ConnectionTestResult } from './types';
import { mockProjects } from './mockData';

// Créer une instance du client Notion
const notionClient = new NotionClient();

/**
 * Service Notion principal
 */
class NotionService {
  /**
   * Configure le service Notion
   */
  configure(config: NotionConfig): void {
    notionClient.configure(config);
  }
  
  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return notionClient.isConfigured();
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig {
    return notionClient.getConfig();
  }
  
  /**
   * Active ou désactive le mode mock
   */
  setMockMode(enabled: boolean): void {
    notionClient.setMockMode(enabled);
  }
  
  /**
   * Vérifie si le mode mock est actif
   */
  isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return notionClient.testConnection();
  }
  
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: mockProjects
      };
    }
    
    // En mode réel, interroger Notion
    // Pour l'instant, on renvoie quand même des données simulées
    return {
      success: true,
      data: mockProjects.slice(0, 2) // Moins de projets en mode réel pour différencier
    };
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const project = mockProjects.find(p => p.id === id);
      
      if (!project) {
        return {
          success: false,
          error: { message: `Projet #${id} non trouvé` }
        };
      }
      
      return {
        success: true,
        data: project
      };
    }
    
    // En mode réel, interroger Notion
    // Pour l'instant, on renvoie quand même des données simulées
    const project = mockProjects.find(p => p.id === id);
    
    if (!project) {
      return {
        success: false,
        error: { message: `Projet #${id} non trouvé` }
      };
    }
    
    return {
      success: true,
      data: project
    };
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(projectData: Partial<Project>): Promise<NotionResponse<Project>> {
    // Vérifier que les données minimales sont fournies
    if (!projectData.name) {
      return {
        success: false,
        error: { message: 'Le nom du projet est requis' }
      };
    }
    
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      // Déterminer le statut du projet (avec une valeur par défaut valide)
      const status: ProjectStatus = (projectData.status as ProjectStatus) || 'active';
      
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: projectData.name,
        url: projectData.url || '',
        description: projectData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: status,
        progress: 0,
        pagesCount: 0,
        itemsCount: 0
      };
      
      return {
        success: true,
        data: newProject
      };
    }
    
    // En mode réel, créer le projet dans Notion
    // Pour l'instant, on simule quand même
    const status: ProjectStatus = (projectData.status as ProjectStatus) || 'active';
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name,
      url: projectData.url || '',
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: status,
      progress: 0,
      pagesCount: 0,
      itemsCount: 0
    };
    
    return {
      success: true,
      data: newProject
    };
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(project: Project): Promise<NotionResponse<Project>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      // Vérifier que le projet existe
      const existingIndex = mockProjects.findIndex(p => p.id === project.id);
      
      if (existingIndex === -1) {
        return {
          success: false,
          error: { message: `Projet #${project.id} non trouvé` }
        };
      }
      
      // Mettre à jour le projet
      const updatedProject: Project = {
        ...project,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: updatedProject
      };
    }
    
    // En mode réel, mettre à jour le projet dans Notion
    // Pour l'instant, on simule quand même
    return {
      success: true,
      data: {
        ...project,
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      // Vérifier que le projet existe
      const existingIndex = mockProjects.findIndex(p => p.id === id);
      
      if (existingIndex === -1) {
        return {
          success: false,
          error: { message: `Projet #${id} non trouvé` }
        };
      }
      
      return {
        success: true,
        data: true
      };
    }
    
    // En mode réel, supprimer le projet dans Notion
    // Pour l'instant, on simule quand même
    return {
      success: true,
      data: true
    };
  }
}

// Exporter une instance singleton du service
export const notionService = new NotionService();

// Export par défaut
export default notionService;
