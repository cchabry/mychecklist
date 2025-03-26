
/**
 * Service Notion
 * Ce service expose les méthodes de haut niveau pour interagir avec l'API Notion
 */

import { notionClient } from './notionClient';
import { 
  ConnectionStatus, 
  NotionResponse, 
  NotionConfig,
  ConnectionTestResult
} from './types';

import { Project } from '@/types/domain';

/**
 * Service principal pour Notion
 */
class NotionService {
  /**
   * Configure le service Notion
   */
  configure(apiKey: string, projectsDbId: string, checklistsDbId?: string): void {
    notionClient.configure({
      apiKey,
      projectsDbId,
      checklistsDbId
    });
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
   * Contrôle le mode démo (mock)
   */
  setMockMode(enabled: boolean): void {
    notionClient.setMockMode(enabled);
  }
  
  /**
   * Vérifie si le mode démo est actif
   */
  isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Teste la connexion à Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return notionClient.testConnection();
  }
  
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    const config = this.getConfig();
    if (!config.projectsDbId) {
      return { success: false, error: { message: "Base de données des projets non configurée" } };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (this.isMockMode()) {
      return {
        success: true,
        data: [
          { id: '1', name: 'Projet 1', url: 'https://example.com/projet1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', name: 'Projet 2', url: 'https://example.com/projet2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '3', name: 'Projet 3', url: 'https://example.com/projet3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
      };
    }
    
    // Interroger la base de données Notion
    const response = await notionClient.post<{results: any[]}>(`/databases/${config.projectsDbId}/query`);
    
    if (!response.success || !response.data?.results) {
      return response as NotionResponse<Project[]>;
    }
    
    // Transformer les résultats Notion en projets
    const projects: Project[] = response.data.results.map(page => {
      const properties = page.properties;
      
      return {
        id: page.id,
        name: this.extractTextProperty(properties.Name),
        url: this.extractTextProperty(properties.URL),
        createdAt: page.created_time,
        updatedAt: page.last_edited_time
      };
    });
    
    return {
      success: true,
      data: projects
    };
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    // Si en mode démo, renvoyer des données simulées
    if (this.isMockMode()) {
      return {
        success: true,
        data: {
          id,
          name: `Projet ${id}`,
          url: `https://example.com/projet${id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    const response = await notionClient.get<any>(`/pages/${id}`);
    
    if (!response.success || !response.data) {
      return response as NotionResponse<Project>;
    }
    
    const page = response.data;
    const properties = page.properties;
    
    const project: Project = {
      id: page.id,
      name: this.extractTextProperty(properties.Name),
      url: this.extractTextProperty(properties.URL),
      createdAt: page.created_time,
      updatedAt: page.last_edited_time
    };
    
    return {
      success: true,
      data: project
    };
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(data: { name: string; url?: string }): Promise<NotionResponse<Project>> {
    const config = this.getConfig();
    if (!config.projectsDbId) {
      return { success: false, error: { message: "Base de données des projets non configurée" } };
    }
    
    // Si en mode démo, simuler la création
    if (this.isMockMode()) {
      return {
        success: true,
        data: {
          id: Math.random().toString(36).substring(2, 9),
          name: data.name,
          url: data.url || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    // Préparer les propriétés pour Notion
    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: data.name
            }
          }
        ]
      }
    };
    
    if (data.url) {
      properties.URL = {
        rich_text: [
          {
            text: {
              content: data.url
            }
          }
        ]
      };
    }
    
    // Créer la page dans Notion
    const response = await notionClient.post<any>('/pages', {
      parent: { database_id: config.projectsDbId },
      properties
    });
    
    if (!response.success || !response.data) {
      return response as NotionResponse<Project>;
    }
    
    const newPage = response.data;
    
    // Transformer la réponse en projet
    const project: Project = {
      id: newPage.id,
      name: data.name,
      url: data.url || '',
      createdAt: newPage.created_time,
      updatedAt: newPage.last_edited_time
    };
    
    return {
      success: true,
      data: project
    };
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, data: { name?: string; url?: string }): Promise<NotionResponse<Project>> {
    // Si en mode démo, simuler la mise à jour
    if (this.isMockMode()) {
      return {
        success: true,
        data: {
          id,
          name: data.name || `Projet ${id}`,
          url: data.url || `https://example.com/projet${id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    // Préparer les propriétés à mettre à jour
    const properties: any = {};
    
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
        rich_text: [
          {
            text: {
              content: data.url
            }
          }
        ]
      };
    }
    
    // Mettre à jour la page dans Notion
    const response = await notionClient.patch<any>(`/pages/${id}`, {
      properties
    });
    
    if (!response.success || !response.data) {
      return response as NotionResponse<Project>;
    }
    
    const updatedPage = response.data;
    const updatedProperties = updatedPage.properties;
    
    // Transformer la réponse en projet mis à jour
    const project: Project = {
      id: updatedPage.id,
      name: this.extractTextProperty(updatedProperties.Name),
      url: this.extractTextProperty(updatedProperties.URL),
      createdAt: updatedPage.created_time,
      updatedAt: updatedPage.last_edited_time
    };
    
    return {
      success: true,
      data: project
    };
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (this.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // Dans Notion, on "archive" une page plutôt que de la supprimer
    const response = await notionClient.patch<any>(`/pages/${id}`, {
      archived: true
    });
    
    if (!response.success) {
      return response as NotionResponse<boolean>;
    }
    
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Utilitaire pour extraire le texte d'une propriété Notion
   */
  private extractTextProperty(property: any): string {
    if (!property) return '';
    
    if (property.title && Array.isArray(property.title)) {
      return property.title.map((t: any) => t.plain_text || '').join('');
    }
    
    if (property.rich_text && Array.isArray(property.rich_text)) {
      return property.rich_text.map((t: any) => t.plain_text || '').join('');
    }
    
    return '';
  }
}

// Exporter une instance singleton
export const notionService = new NotionService();

// Export par défaut
export default notionService;
