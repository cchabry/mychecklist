
/**
 * Point d'entrée principal pour BaseNotionService
 * 
 * Ce fichier réexporte la classe finale BaseNotionServiceAbstract sous le nom
 * de BaseNotionService pour maintenir la compatibilité avec le code existant.
 */

import { BaseNotionServiceAbstract } from './BaseNotionServiceAbstract';
import { NotionResponse } from '../types';

/**
 * Classe finale BaseNotionService
 * 
 * Pour la compatibilité avec le code existant, nous exportons directement
 * une classe concrète qui implémente toutes les méthodes abstraites
 * de BaseNotionServiceAbstract avec des fonctionnalités de base.
 */
export class BaseNotionService<
  T extends { id: ID },
  C extends Partial<Omit<T, 'id'>>,
  U = T,
  ID = string
> extends BaseNotionServiceAbstract<T, C, U, ID> {
  
  /**
   * Implémentation de base pour getMockEntities
   */
  protected async getMockEntities(): Promise<T[]> {
    console.warn(`${this.entityName}: getMockEntities non implémenté, retourne liste vide.`);
    return [];
  }
  
  /**
   * Implémentation de base pour mockCreate
   */
  protected async mockCreate(data: C): Promise<T> {
    console.warn(`${this.entityName}: mockCreate non implémenté, données:`, data);
    throw new Error(`Méthode mockCreate non implémentée pour ${this.entityName}`);
  }
  
  /**
   * Implémentation de base pour mockUpdate
   */
  protected async mockUpdate(entity: U): Promise<T> {
    console.warn(`${this.entityName}: mockUpdate non implémenté, données:`, entity);
    throw new Error(`Méthode mockUpdate non implémentée pour ${this.entityName}`);
  }
  
  /**
   * Implémentation de base pour getAllImpl
   */
  protected async getAllImpl(): Promise<NotionResponse<T[]>> {
    return {
      success: false,
      error: {
        message: `Méthode getAllImpl non implémentée pour ${this.entityName}`
      }
    };
  }
  
  /**
   * Implémentation de base pour getByIdImpl
   */
  protected async getByIdImpl(id: ID): Promise<NotionResponse<T>> {
    return {
      success: false,
      error: {
        message: `Méthode getByIdImpl non implémentée pour ${this.entityName}, ID: ${String(id)}`
      }
    };
  }
  
  /**
   * Implémentation de base pour createImpl
   */
  protected async createImpl(data: C): Promise<NotionResponse<T>> {
    return {
      success: false,
      error: {
        message: `Méthode createImpl non implémentée pour ${this.entityName}`
      }
    };
  }
  
  /**
   * Implémentation de base pour updateImpl
   */
  protected async updateImpl(entity: U): Promise<NotionResponse<T>> {
    return {
      success: false,
      error: {
        message: `Méthode updateImpl non implémentée pour ${this.entityName}`
      }
    };
  }
  
  /**
   * Implémentation de base pour deleteImpl
   */
  protected async deleteImpl(id: ID): Promise<NotionResponse<boolean>> {
    return {
      success: false,
      error: {
        message: `Méthode deleteImpl non implémentée pour ${this.entityName}, ID: ${String(id)}`
      }
    };
  }
}
