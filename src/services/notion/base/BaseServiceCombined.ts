
/**
 * Combinaison de la classe de service de base et de l'interface abstraite
 * pour faciliter l'implémentation des services spécifiques
 */

import { BaseNotionServiceAbstract } from './BaseNotionServiceAbstract';
import { NotionResponse } from '../types';
import { StandardFilterOptions } from './types';

/**
 * Service Notion combiné avec l'implémentation abstraite et l'interface opérationnelle
 * Cette classe facilite l'implémentation des services spécifiques en
 * fournissant une structure standard et des méthodes abstraites à implémenter
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création (Create)
 * @template U - Type pour la mise à jour (Update)
 * @template ID - Type d'identifiant
 */
export abstract class BaseServiceCombined<T, C, U, ID = string> 
  extends BaseNotionServiceAbstract<T, C, U, ID> {
  
  /**
   * Récupère toutes les entités
   */
  async getAll(options?: StandardFilterOptions<T>): Promise<NotionResponse<T[]>> {
    // En mode mock, utiliser les entités fictives
    if (this.isMockMode()) {
      try {
        const mockEntities = await this.getMockEntities(options);
        return {
          success: true,
          data: mockEntities
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la récupération des entités mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    // En mode réel, utiliser l'implémentation concrète
    return this.getAllImpl(options);
  }
  
  /**
   * Récupère une entité par son ID
   */
  async getById(id: ID): Promise<NotionResponse<T>> {
    // En mode mock, rechercher dans les entités fictives
    if (this.isMockMode()) {
      try {
        const mockEntities = await this.getMockEntities();
        const entity = mockEntities.find((e: any) => e.id === id);
        
        if (!entity) {
          return {
            success: false,
            error: {
              message: `Entité #${String(id)} non trouvée`
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
            message: `Erreur lors de la récupération de l'entité mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    // En mode réel, utiliser l'implémentation concrète
    return this.getByIdImpl(id);
  }
  
  /**
   * Crée une nouvelle entité
   */
  async create(data: C): Promise<NotionResponse<T>> {
    // En mode mock, créer une entité fictive
    if (this.isMockMode()) {
      try {
        const newEntity = await this.mockCreate(data);
        return {
          success: true,
          data: newEntity
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la création de l'entité mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    // En mode réel, utiliser l'implémentation concrète
    return this.createImpl(data);
  }
  
  /**
   * Met à jour une entité existante
   */
  async update(entity: U): Promise<NotionResponse<T>> {
    // En mode mock, mettre à jour une entité fictive
    if (this.isMockMode()) {
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
            message: `Erreur lors de la mise à jour de l'entité mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    // En mode réel, utiliser l'implémentation concrète
    return this.updateImpl(entity);
  }
  
  /**
   * Supprime une entité
   */
  async delete(id: ID): Promise<NotionResponse<boolean>> {
    // En mode mock, simuler la suppression
    if (this.isMockMode()) {
      try {
        return {
          success: true,
          data: true
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la suppression de l'entité mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    // En mode réel, utiliser l'implémentation concrète
    return this.deleteImpl(id);
  }
  
  /**
   * Implémentation de la récupération des entités
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract getAllImpl(options?: StandardFilterOptions<T>): Promise<NotionResponse<T[]>>;
  
  /**
   * Implémentation de la récupération d'une entité par son ID
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la création d'une entité
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la mise à jour d'une entité
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la suppression d'une entité
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}

// Créer et exporter la classe BaseNotionService comme alias pour maintenir la compatibilité
export const BaseNotionService = BaseServiceCombined;
