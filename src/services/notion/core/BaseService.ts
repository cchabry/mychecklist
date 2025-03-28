
/**
 * Service de base pour les entités Notion
 * 
 * Fournit une implémentation de base pour les opérations CRUD
 * avec support du mode démo et des méthodes standardisées.
 */

import { v4 as uuidv4 } from 'uuid';
import { notionClient } from '../client/notionClient';
import { CrudService, NotionResponse, StandardFilterOptions, NotionConfig } from '../types';

/**
 * Génère un ID mock unique pour une entité
 * 
 * @param prefix Préfixe pour l'ID (pour identifier le type d'entité)
 * @returns ID mock unique
 */
export function generateMockId(prefix: string = 'entity'): string {
  return `${prefix}_${uuidv4().substring(0, 8)}`;
}

/**
 * Service de base pour les entités Notion
 * 
 * @template T Type de l'entité
 * @template C Type des données pour la création
 * @template U Type des données pour la mise à jour
 */
export abstract class BaseService<T, C = Partial<T>, U = Partial<T>> implements CrudService<T, StandardFilterOptions, C, U> {
  /** Nom du service (pour le logging) */
  protected readonly serviceName: string;
  
  /** Clé de configuration pour l'ID de la base de données */
  protected readonly dbConfigKey: keyof NotionConfig;
  
  /**
   * Constructeur du service de base
   * 
   * @param serviceName Nom du service
   * @param dbConfigKey Clé de configuration pour l'ID de la base de données
   */
  constructor(serviceName: string, dbConfigKey: keyof NotionConfig) {
    this.serviceName = serviceName;
    this.dbConfigKey = dbConfigKey;
  }
  
  /**
   * Vérifie si le service est en mode démo
   * 
   * @returns true si le service est en mode démo
   */
  protected isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Récupère la configuration du client Notion
   * 
   * @returns Configuration du client Notion
   */
  protected getConfig(): NotionConfig {
    return notionClient.getConfig();
  }
  
  /**
   * Récupère toutes les entités
   * 
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  async getAll(filter?: StandardFilterOptions): Promise<NotionResponse<T[]>> {
    try {
      if (this.isMockMode()) {
        const mockEntities = await this.getMockEntities(filter);
        return {
          success: true,
          data: mockEntities
        };
      }
      
      return await this.getAllImpl(filter);
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération des ${this.serviceName}: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Récupère une entité par son ID
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers l'entité
   */
  async getById(id: string): Promise<NotionResponse<T>> {
    try {
      if (this.isMockMode()) {
        const mockEntities = await this.getMockEntities();
        const entity = mockEntities.find((e: any) => e.id === id);
        
        if (!entity) {
          return {
            success: false,
            error: {
              message: `${this.serviceName} #${id} non trouvé`
            }
          };
        }
        
        return {
          success: true,
          data: entity
        };
      }
      
      return await this.getByIdImpl(id);
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération du ${this.serviceName} #${id}: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Crée une nouvelle entité
   * 
   * @param data Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  async create(data: C): Promise<NotionResponse<T>> {
    try {
      if (this.isMockMode()) {
        const entity = await this.mockCreate(data);
        return {
          success: true,
          data: entity
        };
      }
      
      return await this.createImpl(data);
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du ${this.serviceName}: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Met à jour une entité existante
   * 
   * @param id ID de l'entité
   * @param data Données pour la mise à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  async update(id: string, data: U): Promise<NotionResponse<T>> {
    try {
      if (this.isMockMode()) {
        const existingResponse = await this.getById(id);
        
        if (!existingResponse.success || !existingResponse.data) {
          return {
            success: false,
            error: {
              message: `${this.serviceName} #${id} non trouvé`
            }
          };
        }
        
        const updatedEntity = {
          ...existingResponse.data,
          ...data
        } as unknown as T;
        
        const result = await this.mockUpdate(updatedEntity);
        
        return {
          success: true,
          data: result
        };
      }
      
      return await this.updateImpl(id, data);
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du ${this.serviceName} #${id}: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Supprime une entité
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers un booléen indiquant le succès
   */
  async delete(id: string): Promise<NotionResponse<boolean>> {
    try {
      if (this.isMockMode()) {
        // En mode mock, on simule toujours une suppression réussie
        return {
          success: true,
          data: true
        };
      }
      
      return await this.deleteImpl(id);
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du ${this.serviceName} #${id}: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Génère des entités fictives pour le mode mock
   * 
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  protected abstract getMockEntities(filter?: StandardFilterOptions): Promise<T[]>;
  
  /**
   * Crée une entité fictive en mode mock
   * 
   * @param data Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  protected abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Met à jour une entité fictive en mode mock
   * 
   * @param entity Entité à mettre à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  protected abstract mockUpdate(entity: T): Promise<T>;
  
  /**
   * Implémentation de la récupération de toutes les entités
   * 
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  protected async getAllImpl(filter?: StandardFilterOptions): Promise<NotionResponse<T[]>> {
    // Implémentation par défaut utilisant des données mock
    const mockEntities = await this.getMockEntities(filter);
    return {
      success: true,
      data: mockEntities
    };
  }
  
  /**
   * Implémentation de la récupération d'une entité par son ID
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers l'entité
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<T>> {
    // Implémentation par défaut utilisant des données mock
    try {
      const mockEntities = await this.getMockEntities();
      const entity = mockEntities.find((e: any) => e.id === id);
      
      if (!entity) {
        return {
          success: false,
          error: {
            message: `${this.serviceName} #${id} non trouvé`
          }
        };
      }
      
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération de l'entité: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la création d'une entité
   * 
   * @param data Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  protected async createImpl(data: C): Promise<NotionResponse<T>> {
    // Implémentation par défaut utilisant des données mock
    try {
      const entity = await this.mockCreate(data);
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la création de l'entité: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la mise à jour d'une entité
   * 
   * @param id ID de l'entité
   * @param data Données pour la mise à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  protected async updateImpl(id: string, data: U): Promise<NotionResponse<T>> {
    // Implémentation par défaut utilisant des données mock
    try {
      const existingResponse = await this.getById(id);
      
      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: {
            message: `${this.serviceName} #${id} non trouvé`
          }
        };
      }
      
      const updatedEntity = {
        ...existingResponse.data,
        ...data
      } as unknown as T;
      
      const result = await this.mockUpdate(updatedEntity);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour de l'entité: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la suppression d'une entité
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers un booléen indiquant le succès
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    // Implémentation par défaut: simuler un succès
    return {
      success: true,
      data: true
    };
  }
}
