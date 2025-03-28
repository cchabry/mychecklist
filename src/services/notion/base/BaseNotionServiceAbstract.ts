
/**
 * Classe abstraite définissant les méthodes requises
 * pour l'implémentation d'un service Notion
 */

import { NotionResponse } from '../types';
import { CrudService, StandardFilterOptions } from './types';
import { notionClient } from '../client/notionClient';

/**
 * Classe abstraite définissant les méthodes requises
 * pour l'implémentation d'un service Notion
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création (Create)
 * @template U - Type pour la mise à jour (Update)
 * @template ID - Type d'identifiant
 */
export abstract class BaseNotionServiceAbstract<T, C, U, ID = string> implements CrudService<T, C, U, ID> {
  /**
   * Nom de l'entité pour les messages d'erreur
   */
  protected readonly entityName: string;
  
  /**
   * Clé de configuration pour l'ID de la base de données
   */
  protected readonly dbConfigKey: string;
  
  /**
   * Constructeur
   * @param entityName Nom de l'entité pour les messages d'erreur
   * @param dbConfigKey Clé de configuration pour l'ID de la base de données
   */
  constructor(entityName: string, dbConfigKey: string) {
    this.entityName = entityName;
    this.dbConfigKey = dbConfigKey;
  }
  
  /**
   * Vérifie si le service est en mode mock
   */
  public isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Méthode abstraite pour générer des entités fictives
   * Doit être implémentée par les sous-classes
   */
  protected abstract getMockEntities(): Promise<T[]>;
  
  /**
   * Méthode abstraite pour créer une entité fictive
   * Doit être implémentée par les sous-classes
   */
  protected abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Méthode abstraite pour mettre à jour une entité fictive
   * Doit être implémentée par les sous-classes
   */
  protected abstract mockUpdate(entity: U): Promise<T>;
  
  /**
   * Méthode abstraite pour l'implémentation de la récupération des entités
   * Doit être implémentée par les sous-classes
   */
  protected abstract getAllImpl(): Promise<NotionResponse<T[]>>;
  
  /**
   * Méthode abstraite pour l'implémentation de la récupération d'une entité par ID
   * Doit être implémentée par les sous-classes
   */
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Méthode abstraite pour l'implémentation de la création d'une entité
   * Doit être implémentée par les sous-classes
   */
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Méthode abstraite pour l'implémentation de la mise à jour d'une entité
   * Doit être implémentée par les sous-classes
   */
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Méthode abstraite pour l'implémentation de la suppression d'une entité
   * Doit être implémentée par les sous-classes
   */
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
  
  /**
   * Récupère toutes les entités
   */
  public async getAll(options?: StandardFilterOptions<T>): Promise<NotionResponse<T[]>> {
    try {
      if (this.isMockMode()) {
        // Mode mock
        const entities = await this.getMockEntities();
        
        // Appliquer le filtrage si des options sont fournies
        const filteredEntities = options?.filter
          ? entities.filter(options.filter)
          : entities;
        
        return {
          success: true,
          data: filteredEntities
        };
      } else {
        // Mode API
        return await this.getAllImpl();
      }
    } catch (e) {
      console.error(`Erreur lors de la récupération des ${this.entityName}s:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération des ${this.entityName}s: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Récupère une entité par son ID
   */
  public async getById(id: ID): Promise<NotionResponse<T>> {
    try {
      if (this.isMockMode()) {
        // Mode mock
        const entities = await this.getMockEntities();
        const entity = entities.find(e => (e as any).id === id);
        
        if (!entity) {
          return {
            success: false,
            error: {
              message: `${this.entityName} avec l'ID ${String(id)} non trouvé`
            }
          };
        }
        
        return {
          success: true,
          data: entity
        };
      } else {
        // Mode API
        return await this.getByIdImpl(id);
      }
    } catch (e) {
      console.error(`Erreur lors de la récupération du ${this.entityName} #${String(id)}:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération du ${this.entityName} #${String(id)}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Crée une nouvelle entité
   */
  public async create(data: C): Promise<NotionResponse<T>> {
    try {
      if (this.isMockMode()) {
        // Mode mock
        const newEntity = await this.mockCreate(data);
        
        return {
          success: true,
          data: newEntity
        };
      } else {
        // Mode API
        return await this.createImpl(data);
      }
    } catch (e) {
      console.error(`Erreur lors de la création du ${this.entityName}:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du ${this.entityName}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Met à jour une entité existante
   */
  public async update(entity: U): Promise<NotionResponse<T>> {
    try {
      if (this.isMockMode()) {
        // Mode mock
        const updatedEntity = await this.mockUpdate(entity);
        
        return {
          success: true,
          data: updatedEntity
        };
      } else {
        // Mode API
        return await this.updateImpl(entity);
      }
    } catch (e) {
      console.error(`Erreur lors de la mise à jour du ${this.entityName}:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du ${this.entityName}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Supprime une entité
   */
  public async delete(id: ID): Promise<NotionResponse<boolean>> {
    try {
      if (this.isMockMode()) {
        // Mode mock - simuler une suppression réussie
        return {
          success: true,
          data: true
        };
      } else {
        // Mode API
        return await this.deleteImpl(id);
      }
    } catch (e) {
      console.error(`Erreur lors de la suppression du ${this.entityName} #${String(id)}:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du ${this.entityName} #${String(id)}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
}
