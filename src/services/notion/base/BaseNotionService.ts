
/**
 * Service de base pour les opérations Notion
 */

import { notionClient } from '../client';
import { NotionConfig, NotionResponse } from '../types';
import { CrudService, StandardFilterOptions } from './types';

/**
 * Service de base pour les opérations Notion communes
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création (Create)
 * @template U - Type pour la mise à jour (Update)
 * @template ID - Type d'identifiant
 */
export abstract class BaseNotionService<T, C, U, ID = string> implements CrudService<T, C, U, ID> {
  /**
   * Type d'entité manipulée
   */
  protected entityType: string;
  
  /**
   * Clé de configuration pour l'ID de base de données
   */
  protected dbIdKey: string;
  
  /**
   * Constructeur du service de base Notion
   * 
   * @param entityType - Type d'entité (pour les logs et messages)
   * @param dbIdKey - Clé dans la configuration pour l'ID de base de données Notion
   */
  constructor(entityType: string, dbIdKey: string) {
    this.entityType = entityType;
    this.dbIdKey = dbIdKey;
  }
  
  /**
   * Récupère l'ID de base de données à partir de la configuration
   */
  protected getDatabaseId(): string | undefined {
    const config = notionClient.getConfig();
    
    if (!config) {
      return undefined;
    }
    
    // Utiliser l'indexation de type pour accéder à la propriété dynamiquement
    return config[this.dbIdKey as keyof NotionConfig] as string | undefined;
  }
  
  /**
   * Récupère toutes les entités avec filtrage optionnel
   */
  async getAll(options?: StandardFilterOptions<T>): Promise<NotionResponse<T[]>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return {
        success: false,
        error: {
          message: "Configuration Notion non disponible"
        }
      };
    }
    
    // En mode mock, retourner des données simulées
    if (notionClient.isMockMode()) {
      try {
        // Récupérer les entités simulées
        const entities = await this.getMockEntities();
        
        // Appliquer le filtrage si nécessaire
        let filteredEntities = entities;
        
        if (options?.filter) {
          filteredEntities = entities.filter(options.filter);
        }
        
        // Appliquer le tri si nécessaire
        if (options?.sort) {
          filteredEntities.sort(options.sort);
        }
        
        // Appliquer la limite si nécessaire
        if (options?.limit && options.limit > 0) {
          filteredEntities = filteredEntities.slice(0, options.limit);
        }
        
        return {
          success: true,
          data: filteredEntities
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la récupération des ${this.entityType}s simulés: ${(error as Error).message}`
          }
        };
      }
    }
    
    // En mode réel, déléguer à l'implémentation spécifique
    return this.getAllImpl();
  }
  
  /**
   * Récupère une entité par son ID
   */
  async getById(id: ID): Promise<NotionResponse<T>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return {
        success: false,
        error: {
          message: "Configuration Notion non disponible"
        }
      };
    }
    
    // En mode mock, rechercher dans les entités simulées
    if (notionClient.isMockMode()) {
      try {
        const entities = await this.getMockEntities();
        const entity = entities.find(e => (e as any).id === id);
        
        if (entity) {
          return {
            success: true,
            data: entity
          };
        } else {
          return {
            success: false,
            error: {
              message: `${this.entityType} avec l'ID ${String(id)} non trouvé`
            }
          };
        }
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la récupération du ${this.entityType}: ${(error as Error).message}`
          }
        };
      }
    }
    
    // En mode réel, déléguer à l'implémentation spécifique
    return this.getByIdImpl(id);
  }
  
  /**
   * Crée une nouvelle entité
   */
  async create(data: C): Promise<NotionResponse<T>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return {
        success: false,
        error: {
          message: "Configuration Notion non disponible"
        }
      };
    }
    
    // En mode mock, créer une entité simulée
    if (notionClient.isMockMode()) {
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
            message: `Erreur lors de la création du ${this.entityType}: ${(error as Error).message}`
          }
        };
      }
    }
    
    // En mode réel, déléguer à l'implémentation spécifique
    return this.createImpl(data);
  }
  
  /**
   * Met à jour une entité existante
   */
  async update(entity: U): Promise<NotionResponse<T>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return {
        success: false,
        error: {
          message: "Configuration Notion non disponible"
        }
      };
    }
    
    // En mode mock, mettre à jour une entité simulée
    if (notionClient.isMockMode()) {
      try {
        const updatedEntity = await this.mockUpdate(entity);
        
        return {
          success: true,
          data: updatedEntity
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la mise à jour du ${this.entityType}: ${(error as Error).message}`
          }
        };
      }
    }
    
    // En mode réel, déléguer à l'implémentation spécifique
    return this.updateImpl(entity);
  }
  
  /**
   * Supprime une entité
   */
  async delete(id: ID): Promise<NotionResponse<boolean>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return {
        success: false,
        error: {
          message: "Configuration Notion non disponible"
        }
      };
    }
    
    // En mode mock, simuler la suppression
    if (notionClient.isMockMode()) {
      try {
        // Vérifier que l'entité existe
        const entities = await this.getMockEntities();
        const entity = entities.find(e => (e as any).id === id);
        
        if (!entity) {
          return {
            success: false,
            error: {
              message: `${this.entityType} avec l'ID ${String(id)} non trouvé`
            }
          };
        }
        
        return {
          success: true,
          data: true
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la suppression du ${this.entityType}: ${(error as Error).message}`
          }
        };
      }
    }
    
    // En mode réel, déléguer à l'implémentation spécifique
    return this.deleteImpl(id);
  }
  
  /**
   * Génère des entités fictives pour le mode mock
   */
  protected abstract getMockEntities(): Promise<T[]>;
  
  /**
   * Crée une entité fictive en mode mock
   */
  protected abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Met à jour une entité fictive en mode mock
   */
  protected abstract mockUpdate(entity: U): Promise<T>;
  
  /**
   * Implémentation de la récupération des entités
   */
  protected abstract getAllImpl(): Promise<NotionResponse<T[]>>;
  
  /**
   * Implémentation de la récupération d'une entité par son ID
   */
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la création d'une entité
   */
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la mise à jour d'une entité
   */
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la suppression d'une entité
   */
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}
