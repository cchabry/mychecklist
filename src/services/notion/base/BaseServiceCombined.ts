
/**
 * Combinaison de la classe de service de base et de l'interface abstraite
 * pour faciliter l'implémentation des services spécifiques
 */

import { BaseNotionService } from './BaseNotionService';
import { NotionResponse } from '../types';

/**
 * Classe abstraite définissant les méthodes requises
 * pour l'implémentation d'un service Notion
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création (Create)
 * @template U - Type pour la mise à jour (Update)
 * @template ID - Type d'identifiant
 */
export abstract class BaseNotionServiceAbstract<T, C, U, ID = string> {
  /**
   * Génère des entités fictives pour le mode mock
   */
  abstract getMockEntities(): Promise<T[]>;
  
  /**
   * Crée une entité fictive en mode mock
   */
  abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Met à jour une entité fictive en mode mock
   */
  abstract mockUpdate(entity: U): Promise<T>;
  
  /**
   * Implémentation de la récupération des entités
   */
  abstract getAllImpl(): Promise<NotionResponse<T[]>>;
  
  /**
   * Implémentation de la récupération d'une entité par son ID
   */
  abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la création d'une entité
   */
  abstract createImpl(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la mise à jour d'une entité
   */
  abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la suppression d'une entité
   */
  abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}

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
  extends BaseNotionService<T, C, U, ID> 
  implements BaseNotionServiceAbstract<T, C, U, ID> {
  
  /**
   * Implémentation de la récupération des entités
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract getAllImpl(): Promise<NotionResponse<T[]>>;
  
  /**
   * Implémentation de la récupération d'une entité par son ID
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract getByIdImpl(_id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la création d'une entité
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract createImpl(_data: C): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la mise à jour d'une entité
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract updateImpl(_entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la suppression d'une entité
   * La méthode concrète doit être fournie par les classes dérivées
   */
  protected abstract deleteImpl(_id: ID): Promise<NotionResponse<boolean>>;
}
