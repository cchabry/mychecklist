
import { notionClient, ConnectionStatus } from './client';
import { projectsService } from './projects';
import { samplesService } from './samples';
import { auditsService } from './audits';

/**
 * Point d'entrée unifié pour tous les services Notion
 */
export const notionService = {
  client: notionClient,
  projects: projectsService,
  samples: samplesService,
  audits: auditsService,
  
  /**
   * Configure tous les services Notion
   */
  configure(apiKey: string, databaseId: string, checklistsDbId?: string) {
    notionClient.setConfig({
      apiKey,
      databaseId,
      checklistsDbId
    });
    return { apiKey, databaseId, checklistsDbId };
  },
  
  /**
   * Vérifie si Notion est configuré
   */
  isConfigured(): boolean {
    return notionClient.isConfigured();
  },
  
  /**
   * Teste la connexion à Notion
   */
  testConnection() {
    return notionClient.testConnection();
  },
  
  /**
   * Obtient l'état actuel de la connexion
   */
  getConnectionStatus(): ConnectionStatus {
    return notionClient.getStatus();
  }
};

// Exporter les types et classes utiles
export { ConnectionStatus } from './client';
export type { NotionProject } from './projects';
export type { NotionAPIResponse } from './client';
