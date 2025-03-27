
/**
 * Service de base pour Notion
 * 
 * Ce service fournit les fonctionnalités de base pour interagir avec l'API Notion.
 */

import { notionClient } from './client/notionClient';
import { ConnectionTestResult, NotionConfig } from './types';
import { useOperationMode } from '@/hooks/useOperationMode';

/**
 * Service de base pour Notion
 */
class NotionBaseService {
  /**
   * Configure le service Notion
   */
  configure(apiKey: string, projectsDbId: string, checklistsDbId?: string): void {
    const config: NotionConfig = {
      apiKey,
      projectsDbId,
      checklistsDbId,
      mockMode: useOperationMode().isDemoMode
    };
    
    notionClient.configure(config);
    
    // Sauvegarder la configuration dans le localStorage
    this.saveConfig(config);
  }
  
  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return notionClient.isConfigured() || useOperationMode().isDemoMode;
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
    return notionClient.isMockMode() || useOperationMode().isDemoMode;
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return notionClient.testConnection();
  }
  
  /**
   * Sauvegarde la configuration dans le localStorage
   */
  private saveConfig(config: NotionConfig): void {
    try {
      const { apiKey, projectsDbId, checklistsDbId } = config;
      
      // Créer un objet de configuration pour le stockage
      const storageConfig = {
        apiKey,
        projectsDbId,
        checklistsDbId
      };
      
      // Stocker la configuration
      localStorage.setItem('notion_config', JSON.stringify(storageConfig));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration Notion:', error);
    }
  }
  
  /**
   * Charge la configuration depuis le localStorage
   */
  loadConfig(): NotionConfig | null {
    try {
      const configStr = localStorage.getItem('notion_config');
      
      if (!configStr) {
        return null;
      }
      
      const config = JSON.parse(configStr) as Partial<NotionConfig>;
      
      if (!config.apiKey || !config.projectsDbId) {
        return null;
      }
      
      return config as NotionConfig;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration Notion:', error);
      return null;
    }
  }
}

// Exporter une instance singleton
export const notionBaseService = new NotionBaseService();

// Export par défaut
export default notionBaseService;
