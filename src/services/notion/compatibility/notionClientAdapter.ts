
/**
 * Adaptateur pour assurer la compatibilité avec le code existant
 * Ce fichier sert de pont entre l'ancienne API et la nouvelle
 */

import { notionService } from '../client';
import { ApiResponse } from '@/services/apiProxy';
import { currentConfig } from '../config';

/**
 * Version compatible de l'ancien client Notion qui utilise la nouvelle architecture
 */
export const notionClientAdapter = {
  /**
   * Vérifie si le client est configuré
   */
  isConfigured: (): boolean => {
    return notionService.client.isConfigured();
  },
  
  /**
   * Configure le client avec les informations d'identification
   */
  configure: (apiKey: string, databaseId: string, checklistsDbId?: string): void => {
    // Mettre à jour la configuration
    const updateData = {
      apiKey,
      databaseIds: {
        projects: databaseId,
        checklists: checklistsDbId || null
      }
    };
    
    // Enregistrer dans le système de configuration
    import('../config').then(({ updateConfig }) => {
      updateConfig(updateData);
    });
  },
  
  /**
   * Teste la connexion à l'API Notion
   */
  testConnection: async (): Promise<any> => {
    const response = await notionService.users.testConnection();
    
    // Transformer la réponse au format attendu par l'ancien code
    if (response.success) {
      return {
        success: true,
        user: response.user,
        // Ajouter des informations supplémentaires pour compatibilité
        projectsDbName: currentConfig.databaseIds.projects || '(Non configurée)',
        checklistsDbName: currentConfig.databaseIds.checklists || '(Non configurée)',
        hasChecklistsDb: !!currentConfig.databaseIds.checklists
      };
    } else {
      return {
        success: false,
        error: response.error || 'Erreur inconnue',
        details: response.details
      };
    }
  },
  
  /**
   * Effectue une requête GET à l'API Notion
   */
  get: async <T>(endpoint: string, params: Record<string, any> = {}): Promise<any> => {
    const response = await notionService.client.get<T>(endpoint);
    return transformResponse(response);
  },
  
  /**
   * Effectue une requête POST à l'API Notion
   */
  post: async <T>(endpoint: string, data: any): Promise<any> => {
    const response = await notionService.client.post<T>(endpoint, data);
    return transformResponse(response);
  },
  
  /**
   * Effectue une requête PATCH à l'API Notion
   */
  patch: async <T>(endpoint: string, data: any): Promise<any> => {
    const response = await notionService.client.patch<T>(endpoint, data);
    return transformResponse(response);
  },
  
  /**
   * Effectue une requête DELETE à l'API Notion
   */
  delete: async <T>(endpoint: string): Promise<any> => {
    const response = await notionService.client.delete<T>(endpoint);
    return transformResponse(response);
  }
};

/**
 * Transforme une réponse du nouveau format vers l'ancien format
 */
function transformResponse<T>(response: ApiResponse<T>): any {
  if (response.success && response.data) {
    // Si réussite, retourner directement les données
    return response.data;
  } else {
    // Si échec, lancer une erreur pour maintenir la compatibilité
    const error = new Error(response.error?.message || 'Erreur inconnue');
    
    // Ajouter des détails supplémentaires à l'erreur si disponibles
    if (response.error?.details) {
      (error as any).details = response.error.details;
    }
    
    throw error;
  }
}

// Exporter par défaut pour utilisation directe
export default notionClientAdapter;
