
/**
 * Service Notion pour gérer l'accès à l'API Notion
 */

import { NotionClient } from './notionClient';
import { ConnectionStatus, NotionConfig, NotionResponse, ConnectionTestResult } from './types';
import demoData from './mockData';

/**
 * Service pour interagir avec l'API Notion
 */
class NotionService {
  private client: NotionClient;
  
  constructor() {
    this.client = new NotionClient();
    
    // Initialiser à partir du localStorage
    this.initializeFromStorage();
  }
  
  /**
   * Initialise la configuration à partir du localStorage
   */
  private initializeFromStorage(): void {
    const apiKey = localStorage.getItem('notion_api_key');
    const projectsDbId = localStorage.getItem('notion_database_id');
    const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
    
    // Si nous avons des valeurs dans le localStorage, configurer le client
    if (apiKey && projectsDbId) {
      this.client.configure({
        apiKey,
        projectsDbId,
        checklistsDbId: checklistsDbId || undefined,
        mockMode: localStorage.getItem('notion_mock_mode') === 'true',
        debug: process.env.NODE_ENV === 'development'
      });
    }
  }
  
  /**
   * Configure le service Notion
   */
  configure(config: NotionConfig): void {
    this.client.configure(config);
    
    // Sauvegarder dans le localStorage si la configuration est valide
    if (config.apiKey && config.projectsDbId) {
      localStorage.setItem('notion_api_key', config.apiKey);
      localStorage.setItem('notion_database_id', config.projectsDbId);
      
      if (config.checklistsDbId) {
        localStorage.setItem('notion_checklists_database_id', config.checklistsDbId);
      }
      
      if (config.mockMode !== undefined) {
        localStorage.setItem('notion_mock_mode', config.mockMode.toString());
      }
    }
  }
  
  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return this.client.isConfigured();
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig {
    return this.client.getConfig();
  }
  
  /**
   * Active ou désactive le mode mock
   */
  setMockMode(enabled: boolean): void {
    this.client.setMockMode(enabled);
    localStorage.setItem('notion_mock_mode', enabled.toString());
  }
  
  /**
   * Vérifie si le mode mock est actif
   */
  isMockMode(): boolean {
    return this.client.isMockMode();
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return this.client.testConnection();
  }
  
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse> {
    if (this.isMockMode()) {
      // En mode démo, retourner des données simulées
      return {
        success: true,
        data: demoData.projects
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Base de données des projets non configurée'
        }
      };
    }
    
    const config = this.getConfig();
    
    try {
      // Simuler une requête à l'API dans cette version
      // Dans une version ultérieure, nous intégrerons l'API Notion réelle
      // Pour l'instant, retournons les données de démo
      
      return {
        success: true,
        data: demoData.projects
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      };
    }
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse> {
    if (this.isMockMode()) {
      // En mode démo, rechercher dans les données simulées
      const project = demoData.projects.find(p => p.id === id);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Projet #${id} non trouvé`
          }
        };
      }
      
      return {
        success: true,
        data: project
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Base de données des projets non configurée'
        }
      };
    }
    
    try {
      // Simuler une requête à l'API dans cette version
      // Pour l'instant, retournons les données de démo
      const project = demoData.projects.find(p => p.id === id);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Projet #${id} non trouvé`
          }
        };
      }
      
      return {
        success: true,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      };
    }
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(data: any): Promise<NotionResponse> {
    if (this.isMockMode()) {
      // En mode démo, simuler la création d'un projet
      const newProject = {
        id: `proj_${Date.now()}`,
        name: data.name,
        url: data.url,
        description: data.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      };
      
      // Ajouter le projet aux données de démo
      demoData.projects.push(newProject);
      
      return {
        success: true,
        data: newProject
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Base de données des projets non configurée'
        }
      };
    }
    
    try {
      // Simuler une requête à l'API dans cette version
      // Pour l'instant, simulons un nouvel enregistrement
      const newProject = {
        id: `proj_${Date.now()}`,
        name: data.name,
        url: data.url,
        description: data.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      };
      
      return {
        success: true,
        data: newProject
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      };
    }
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(project: any): Promise<NotionResponse> {
    if (this.isMockMode()) {
      // En mode démo, rechercher et mettre à jour le projet
      const index = demoData.projects.findIndex(p => p.id === project.id);
      
      if (index === -1) {
        return {
          success: false,
          error: {
            message: `Projet #${project.id} non trouvé`
          }
        };
      }
      
      // Mettre à jour le projet
      demoData.projects[index] = {
        ...demoData.projects[index],
        name: project.name,
        url: project.url,
        description: project.description,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: demoData.projects[index]
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Base de données des projets non configurée'
        }
      };
    }
    
    try {
      // Simuler une requête à l'API dans cette version
      // Pour l'instant, simulons la mise à jour
      return {
        success: true,
        data: {
          ...project,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      };
    }
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse> {
    if (this.isMockMode()) {
      // En mode démo, rechercher et supprimer le projet
      const index = demoData.projects.findIndex(p => p.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: {
            message: `Projet #${id} non trouvé`
          }
        };
      }
      
      // Supprimer le projet
      demoData.projects.splice(index, 1);
      
      return {
        success: true,
        data: { id }
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Base de données des projets non configurée'
        }
      };
    }
    
    try {
      // Simuler une requête à l'API dans cette version
      return {
        success: true,
        data: { id }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      };
    }
  }
}

// Créer une instance singleton
export const notionService = new NotionService();

// Export par défaut
export default notionService;
