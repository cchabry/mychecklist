
/**
 * Service de base Notion
 * 
 * Ce service fournit une interface simplifiée pour configurer et interagir
 * avec l'API Notion. Il sert de couche d'abstraction au-dessus du client Notion.
 */

import { notionClient } from './client';
import { ConnectionTestResult } from './types';

/**
 * Service de base pour l'API Notion
 * 
 * Fournit des fonctionnalités de base pour configurer et interagir
 * avec l'API Notion.
 */
class NotionBaseService {
  /**
   * Configure le service Notion avec les informations nécessaires
   * 
   * @param apiKey Clé d'API Notion
   * @param projectsDbId ID de la base de données projets
   * @param checklistsDbId ID de la base de données checklist (optionnel)
   */
  configure(apiKey: string, projectsDbId: string, checklistsDbId?: string): void {
    notionClient.configure({
      apiKey,
      projectsDbId,
      checklistsDbId
    });
  }
  
  /**
   * Vérifie si le service est correctement configuré
   * 
   * @returns true si le service est configuré avec les informations minimales
   */
  isConfigured(): boolean {
    return notionClient.isConfigured();
  }
  
  /**
   * Récupère la configuration actuelle
   * 
   * @returns Copie de la configuration actuelle
   */
  getConfig() {
    return notionClient.getConfig();
  }
  
  /**
   * Active ou désactive le mode mock
   * 
   * @param enabled État souhaité du mode mock
   */
  setMockMode(enabled: boolean): void {
    notionClient.setMockMode(enabled);
  }
  
  /**
   * Vérifie si le mode mock est actif
   * 
   * @returns true si le client est en mode mock/démo
   */
  isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Teste la connexion à l'API Notion
   * 
   * @returns Résultat du test
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return notionClient.testConnection();
  }
}

// Exporter une instance singleton
export const notionBaseService = new NotionBaseService();

// Export par défaut
export default notionBaseService;
