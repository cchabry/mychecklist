
/**
 * Méthodes supplémentaires pour le BaseNotionService
 * 
 * Ce fichier contient les implémentations des méthodes create, update et delete
 * pour la classe BaseNotionService.
 */

import { NotionResponse } from '../types';
import { BaseNotionService } from './BaseNotionService';

/**
 * Extension de la classe BaseNotionService avec les méthodes de manipulation
 */
export abstract class BaseNotionServiceMethods<
  T extends { id: ID },
  C extends Partial<Omit<T, 'id'>>,
  U = T,
  ID = string
> extends BaseNotionService<T, C, U, ID> {
  /**
   * Crée une nouvelle entité
   * 
   * @param data Données pour la création
   * @returns Promesse résolvant vers une réponse contenant l'entité créée
   */
  async create(data: C): Promise<NotionResponse<T>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: await this.mockCreate(data)
      };
    }
    
    try {
      return await this.createImpl(data);
    } catch (error) {
      console.error(`${this.serviceName}.create error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du ${this.serviceName}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Met à jour une entité existante
   * 
   * @param entity Entité avec les modifications
   * @returns Promesse résolvant vers une réponse contenant l'entité mise à jour
   */
  async update(entity: U): Promise<NotionResponse<T>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: await this.mockUpdate(entity)
      };
    }
    
    try {
      return await this.updateImpl(entity);
    } catch (error) {
      console.error(`${this.serviceName}.update error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du ${this.serviceName}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Supprime une entité
   * 
   * @param id Identifiant de l'entité
   * @returns Promesse résolvant vers une réponse indiquant le succès
   */
  async delete(id: ID): Promise<NotionResponse<boolean>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    try {
      return await this.deleteImpl(id);
    } catch (error) {
      console.error(`${this.serviceName}.delete error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du ${this.serviceName} #${String(id)}`,
          details: error
        }
      };
    }
  }
}
