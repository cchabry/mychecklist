
/**
 * Définition des méthodes abstraites pour BaseNotionService
 * 
 * Cette classe contient les définitions des méthodes abstraites que les services
 * qui étendent BaseNotionService doivent implémenter.
 */

import { NotionResponse } from '../types';
import { BaseNotionServiceMethods } from './BaseNotionServiceMethods';

/**
 * Extension finale du BaseNotionService avec les méthodes abstraites
 */
export abstract class BaseNotionServiceAbstract<
  T extends { id: ID },
  C extends Partial<Omit<T, 'id'>>,
  U = T,
  ID = string
> extends BaseNotionServiceMethods<T, C, U, ID> {
  // Méthodes abstraites à implémenter par les services spécifiques
  
  /**
   * Génère des entités fictives pour le mode mock
   * @param filter Filtre(s) optionnel(s)
   */
  protected abstract getMockEntities(filter?: Record<string, any>): Promise<T[]>;
  
  /**
   * Crée une entité fictive en mode mock
   * @param data Données pour la création
   */
  protected abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Met à jour une entité fictive en mode mock
   * @param entity Entité avec les modifications
   */
  protected abstract mockUpdate(entity: U): Promise<T>;
  
  /**
   * Implémentation de la récupération des entités
   * @param filter Filtre(s) optionnel(s)
   */
  protected abstract getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<T[]>>;
  
  /**
   * Implémentation de la récupération d'une entité par son identifiant
   * @param id Identifiant de l'entité
   */
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la création d'une entité
   * @param data Données pour la création
   */
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la mise à jour d'une entité
   * @param entity Entité avec les modifications
   */
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la suppression d'une entité
   * @param id Identifiant de l'entité
   */
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}
