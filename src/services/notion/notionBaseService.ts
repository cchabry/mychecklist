
/**
 * Service de base pour l'API Notion avec les méthodes communes
 */

import { notionClient } from './notionClient';
import { NotionConfig, ConnectionTestResult } from './types';

/**
 * Service de base pour Notion avec la configuration et les tests
 */
class NotionBaseService {
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
   * Utilitaire pour extraire le texte d'une propriété Notion
   * À disposition des services dérivés
   */
  protected extractTextProperty(property: any): string {
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
export const notionBaseService = new NotionBaseService();

// Export par défaut
export default notionBaseService;
