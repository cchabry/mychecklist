
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
export class BaseNotionService<T, C = Partial<T>, U = Partial<T>> {
  protected entityName: string;
  protected dbConfigKey: string;
  
  constructor(entityName: string, dbConfigKey: string) {
    this.entityName = entityName;
    this.dbConfigKey = dbConfigKey;
  }
  
  /**
   * Récupère toutes les entités, éventuellement filtrées
   */
  async getAll(filter?: Record<string, any>): Promise<NotionResponse<T[]>> {
    if (this.isMockMode()) {
      try {
        const entities = await this.getMockEntities(filter);
        return this.buildSuccessResponse(entities);
      } catch (error) {
        return this.buildErrorResponse(`Erreur lors de la récupération des ${this.entityName}s en mode mock`, error);
      }
    }
    
    return this.safeExecute(
      () => this.getAllImpl(filter),
      `Erreur lors de la récupération des ${this.entityName}s`
    );
  }
  
  /**
   * Récupère une entité par son ID
   */
  async getById(id: string): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      try {
        const entities = await this.getMockEntities();
        const entity = entities.find((e: any) => e.id === id);
        
        if (!entity) {
          return this.buildErrorResponse(`${this.entityName} #${id} non trouvé`);
        }
        
        return this.buildSuccessResponse(entity);
      } catch (error) {
        return this.buildErrorResponse(`Erreur lors de la récupération du ${this.entityName} #${id} en mode mock`, error);
      }
    }
    
    return this.safeExecute(
      () => this.getByIdImpl(id),
      `Erreur lors de la récupération du ${this.entityName} #${id}`
    );
  }
  
  /**
   * Crée une nouvelle entité
   */
  async create(data: C): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      try {
        const entity = await this.mockCreate(data);
        return this.buildSuccessResponse(entity);
      } catch (error) {
        return this.buildErrorResponse(`Erreur lors de la création du ${this.entityName} en mode mock`, error);
      }
    }
    
    return this.safeExecute(
      () => this.createImpl(data),
      `Erreur lors de la création du ${this.entityName}`
    );
  }
  
  /**
   * Met à jour une entité existante
   */
  async update(id: string, data: U): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      try {
        const entities = await this.getMockEntities();
        const entity = entities.find((e: any) => e.id === id);
        
        if (!entity) {
          return this.buildErrorResponse(`${this.entityName} #${id} non trouvé`);
        }
        
        const updatedEntity = { ...entity, ...data } as T;
        return this.buildSuccessResponse(await this.mockUpdate(updatedEntity));
      } catch (error) {
        return this.buildErrorResponse(`Erreur lors de la mise à jour du ${this.entityName} #${id} en mode mock`, error);
      }
    }
    
    return this.safeExecute(
      () => this.updateImpl(id, data),
      `Erreur lors de la mise à jour du ${this.entityName} #${id}`
    );
  }
  
  /**
   * Supprime une entité
   */
  async delete(id: string): Promise<NotionResponse<boolean>> {
    if (this.isMockMode()) {
      try {
        return this.buildSuccessResponse(true);
      } catch (error) {
        return this.buildErrorResponse(`Erreur lors de la suppression du ${this.entityName} #${id} en mode mock`, error);
      }
    }
    
    return this.safeExecute(
      () => this.deleteImpl(id),
      `Erreur lors de la suppression du ${this.entityName} #${id}`
    );
  }
  
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
  protected buildErrorResponse<R>(message: string, details?: any): NotionResponse<R> {
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
  protected buildSuccessResponse<R>(data: R): NotionResponse<R> {
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
    return !!config && !!config.apiKey && !!config[this.dbConfigKey];
  }
  
  /**
   * Exécute une fonction en mode sécurisé avec gestion des erreurs
   */
  protected async safeExecute<R>(
    operation: () => Promise<NotionResponse<R>>,
    errorMessage: string = "Une erreur s'est produite"
  ): Promise<NotionResponse<R>> {
    if (!this.validateConfig()) {
      return this.buildErrorResponse<R>("Configuration Notion non disponible");
    }
    
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return this.buildErrorResponse<R>(
        `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }
  
  // Méthodes abstraites à implémenter par les classes dérivées
  protected async getMockEntities(filter?: Record<string, any>): Promise<T[]> {
    throw new Error("getMockEntities non implémenté");
  }
  
  protected async mockCreate(data: C): Promise<T> {
    throw new Error("mockCreate non implémenté");
  }
  
  protected async mockUpdate(entity: T): Promise<T> {
    throw new Error("mockUpdate non implémenté");
  }
  
  protected async getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<T[]>> {
    throw new Error("getAllImpl non implémenté");
  }
  
  protected async getByIdImpl(id: string): Promise<NotionResponse<T>> {
    throw new Error("getByIdImpl non implémenté");
  }
  
  protected async createImpl(data: C): Promise<NotionResponse<T>> {
    throw new Error("createImpl non implémenté");
  }
  
  protected async updateImpl(id: string, data: U): Promise<NotionResponse<T>> {
    throw new Error("updateImpl non implémenté");
  }
  
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    throw new Error("deleteImpl non implémenté");
  }
}
