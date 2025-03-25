
import { ApiResponse, RequestOptions } from '@/services/apiProxy';
import { operationMode } from '@/services/operationMode';
import { PLACEHOLDER_DATABASE_ID } from '@/services/operationMode/constants';
import { toast } from 'sonner';

/**
 * Options de configuration pour une requête Notion
 */
interface NotionRequestOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: any;
  token?: string;
  showErrorToast?: boolean;
  useMock?: boolean;
}

/**
 * Service centralisé pour toutes les interactions avec l'API Notion
 * Ce service est le point d'entrée unique pour toutes les requêtes à l'API Notion,
 * qu'elles soient via les fonctions serverless, l'API directe, ou des données simulées.
 */
class NotionCentralService {
  /**
   * Effectue une requête à l'API Notion en utilisant le proxy approprié
   */
  async request<T = any>(options: NotionRequestOptions): Promise<T> {
    const { 
      endpoint, 
      method, 
      body, 
      token = localStorage.getItem('notion_api_key') || '', 
      showErrorToast = true,
      useMock = false
    } = options;
    
    // Déterminer si on doit utiliser le mode démo
    const useDemoMode = useMock || operationMode.isDemoMode();
    
    // Traiter l'endpoint pour remplacer les placeholders par des valeurs réelles ou de démo
    const processedEndpoint = operationMode.processEndpoint(endpoint);
    
    console.log(`Requête Notion via proxy Netlify: ${method} ${processedEndpoint}`);
    
    try {
      // En mode démo, simuler une réponse
      if (useDemoMode) {
        return await this.simulateRequest<T>(processedEndpoint, method);
      }
      
      // En mode réel, utiliser la fonction Netlify
      return await this.makeNetlifyRequest<T>(processedEndpoint, method, body, token);
    } catch (error) {
      // Signaler l'erreur au service operationMode
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        `Requête Notion ${method} ${processedEndpoint}`
      );
      
      // Afficher une notification d'erreur si demandé
      if (showErrorToast) {
        toast.error('Erreur de l\'API Notion', {
          description: error instanceof Error ? error.message : String(error)
        });
      }
      
      // Propager l'erreur
      throw error;
    }
  }
  
  /**
   * Effectue une requête via la fonction Netlify
   */
  private async makeNetlifyRequest<T>(
    endpoint: string,
    method: string,
    body?: any,
    token?: string
  ): Promise<T> {
    try {
      const response = await fetch('/.netlify/functions/notion-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          method,
          body,
          token
        })
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Échec de la requête Notion: ${response.status}`, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      // Traiter la réponse JSON
      const data = await response.json();
      
      // Si l'API Notion a retourné une erreur, la formater et la lancer
      if (data && data.object === 'error') {
        throw new Error(`Erreur ${data.status}: ${data.message || 'Erreur inconnue de l\'API Notion'}`);
      }
      
      return data as T;
    } catch (error) {
      console.error('Erreur lors de l\'appel au proxy Netlify:', error);
      throw error;
    }
  }
  
  /**
   * Simule une requête en mode démo
   */
  private async simulateRequest<T>(endpoint: string, method: string): Promise<T> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Logique spécifique selon le endpoint et le method
    if (endpoint.includes('/databases') && endpoint.includes('/query')) {
      // Simuler une requête de base de données
      return {
        object: 'list',
        results: [
          {
            id: 'demo-page-1',
            object: 'page',
            created_time: new Date().toISOString(),
            last_edited_time: new Date().toISOString(),
            properties: {
              Name: { title: [{ plain_text: 'Projet démo 1' }] },
              URL: { url: 'https://example.com/demo1' },
              Status: { select: { name: 'En cours' } },
              Progress: { number: 35 }
            }
          },
          {
            id: 'demo-page-2',
            object: 'page',
            created_time: new Date().toISOString(),
            last_edited_time: new Date().toISOString(),
            properties: {
              Name: { title: [{ plain_text: 'Projet démo 2' }] },
              URL: { url: 'https://example.com/demo2' },
              Status: { select: { name: 'Terminé' } },
              Progress: { number: 100 }
            }
          }
        ]
      } as unknown as T;
    }
    
    if (endpoint.includes('/users/me')) {
      // Simuler une requête utilisateur
      return {
        id: 'demo-user-1',
        name: 'Utilisateur Démo',
        avatar_url: 'https://via.placeholder.com/150',
        type: 'person'
      } as unknown as T;
    }
    
    // Réponse par défaut
    return {
      object: 'success',
      id: 'demo-response',
      created_time: new Date().toISOString()
    } as unknown as T;
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<{ success: boolean; user?: string; error?: string }> {
    // Préserver le mode actuel pour le restaurer après le test
    const currentMode = operationMode.getMode();
    
    try {
      // Forcer temporairement le mode réel pour tester la connexion
      operationMode.temporarilyForceReal();
      
      // Effectuer une requête de test
      const response = await this.request<any>({
        endpoint: '/users/me',
        method: 'GET',
        showErrorToast: false
      });
      
      // Opération réussie, signaler la réussite
      operationMode.handleSuccessfulOperation();
      
      // Si en mode démo, restaurer le mode
      operationMode.restorePreviousMode();
      
      return {
        success: true,
        user: response.name || response.id || 'Utilisateur Notion'
      };
    } catch (error) {
      // Restaurer le mode précédent
      operationMode.restorePreviousMode();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Exporter une instance singleton
export const notionCentralService = new NotionCentralService();
