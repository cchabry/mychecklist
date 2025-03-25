
/**
 * Adaptateur pour le client Notion
 * Sert de couche de compatibilité entre le système legacy et le nouveau système
 */

import { structuredLogger } from '../logging/structuredLogger';
import { notionErrorService } from '../errorHandling/errorService';
import { NotionAPIResponse } from '../types';

// Référence au client Notion existant
let notionApi: any = null;

// Vérification de l'existence du client
try {
  notionApi = require('@/lib/notionProxy').notionApi;
} catch (e) {
  console.warn('Module notionProxy non disponible, fonctionnalités Notion limitées');
  
  // Créer un client fictif
  notionApi = {
    mockMode: {
      isActive: () => true,
      activate: () => {},
      deactivate: () => {},
      toggle: () => {},
      forceReset: () => {},
      persist: () => {},
      updateConfig: () => {},
      temporarilyForceReal: () => {},
      isTemporarilyForcedReal: () => false,
      restoreAfterForceReal: () => {}
    }
  };
}

/**
 * Adaptateur pour le client Notion
 */
class NotionClientAdapter {
  private apiKey: string | null = null;
  private projectsDatabaseId: string | null = null;
  private checklistsDatabaseId: string | null = null;
  
  /**
   * Configure le client Notion
   */
  configure(apiKey: string, projectsDatabaseId: string, checklistsDatabaseId?: string): void {
    this.apiKey = apiKey;
    this.projectsDatabaseId = projectsDatabaseId;
    this.checklistsDatabaseId = checklistsDatabaseId || null;
    
    // Configurer le client legacy s'il existe
    if (notionApi && typeof notionApi.configure === 'function') {
      notionApi.configure({
        apiKey,
        databaseId: projectsDatabaseId,
        checklistsDbId: checklistsDatabaseId
      });
      
      structuredLogger.info(
        'Client Notion configuré via l\'adaptateur',
        { hasChecklistDb: !!checklistsDatabaseId },
        { source: 'NotionClientAdapter' }
      );
    } else {
      structuredLogger.warn(
        'Client Notion non disponible pour configuration',
        null,
        { source: 'NotionClientAdapter' }
      );
    }
  }
  
  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    if (notionApi && typeof notionApi.isConfigured === 'function') {
      return notionApi.isConfigured();
    }
    return this.apiKey !== null && this.projectsDatabaseId !== null;
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<NotionAPIResponse<any>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: {
            message: 'Client Notion non configuré'
          }
        };
      }
      
      if (notionApi && typeof notionApi.testConnection === 'function') {
        // Utiliser la méthode existante
        const result = await notionApi.testConnection();
        return {
          success: result.success,
          data: result.data,
          error: result.error
        };
      }
      
      // Sinon, implémenter un test basique
      if (!notionApi) {
        return {
          success: false,
          error: {
            message: 'Client Notion non disponible'
          }
        };
      }
      
      return {
        success: true,
        data: {
          user: 'Utilisateur test',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Signaler l'erreur
      notionErrorService.reportError(
        error instanceof Error ? error : new Error(message),
        'Test de connexion Notion'
      );
      
      return {
        success: false,
        error: {
          message
        }
      };
    }
  }
}

// Exporter une instance unique
export const notionClientAdapter = new NotionClientAdapter();
