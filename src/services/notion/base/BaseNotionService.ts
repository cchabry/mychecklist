
/**
 * Service Notion de base
 * 
 * Ce module fournit une classe de base pour tous les services Notion,
 * garantissant un comportement cohérent et des méthodes utilitaires communes.
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse } from '../types';

/**
 * Options de filtrage standardisées
 */
export interface StandardFilterOptions {
  /** Valeur de recherche textuelle */
  search?: string;
  /** Limite de résultats à retourner */
  limit?: number;
  /** Jeton de pagination */
  startCursor?: string;
  /** Champ sur lequel trier */
  sortBy?: string;
  /** Direction de tri (asc ou desc) */
  sortDirection?: 'asc' | 'desc';
  /** Identifiant de la base de données (pour les requêtes personnalisées) */
  databaseId?: string;
}

/**
 * Interface pour les services CRUD
 */
export interface CrudService<T, F = StandardFilterOptions, C = Partial<T>, U = Partial<T>> {
  getAll(filters?: F): Promise<NotionResponse<T[]>>;
  getById(id: string): Promise<NotionResponse<T>>;
  create(data: C): Promise<NotionResponse<T>>;
  update(id: string, data: U): Promise<NotionResponse<T>>;
  delete(id: string): Promise<NotionResponse<boolean>>;
}

/**
 * Génère un ID unique pour les entités en mode mock
 * 
 * @param prefix - Préfixe pour l'ID (ex: 'project', 'checklist')
 * @returns Un ID unique en chaîne de caractères
 */
export function generateMockId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix ? `${prefix}-` : ''}${timestamp}-${random}`;
}

/**
 * Classe de base pour les services Notion
 * 
 * Fournit des méthodes et propriétés communes à tous les services Notion,
 * ainsi qu'une gestion cohérente des erreurs et du mode mock.
 */
export class BaseNotionService {
  /**
   * Vérifie si le mode mock est actif
   */
  protected isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Récupère la configuration Notion
   */
  protected getConfig() {
    return notionClient.getConfig();
  }
  
  /**
   * Construit une réponse d'erreur standardisée
   */
  protected buildErrorResponse<T>(message: string, details?: any): NotionResponse<T> {
    return {
      success: false,
      error: {
        message,
        details
      }
    };
  }
  
  /**
   * Construit une réponse de succès standardisée
   */
  protected buildSuccessResponse<T>(data: T): NotionResponse<T> {
    return {
      success: true,
      data
    };
  }
  
  /**
   * Vérifie si une configuration valide est disponible
   */
  protected validateConfig(): boolean {
    const config = this.getConfig();
    return !!config && !!config.apiKey && !!config.projectsDbId;
  }
  
  /**
   * Exécute une fonction en mode sécurisé avec gestion des erreurs
   */
  protected async safeExecute<T>(
    operation: () => Promise<T>,
    errorMessage: string = "Une erreur s'est produite"
  ): Promise<NotionResponse<T>> {
    if (!this.validateConfig()) {
      return this.buildErrorResponse<T>("Configuration Notion non disponible");
    }
    
    try {
      const result = await operation();
      return this.buildSuccessResponse<T>(result);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return this.buildErrorResponse<T>(
        `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }
}
