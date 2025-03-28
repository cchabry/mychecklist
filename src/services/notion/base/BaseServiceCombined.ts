
/**
 * Combinaison de la classe de service de base et de l'interface abstraite
 * pour faciliter l'implémentation des services spécifiques
 */

import { BaseNotionServiceAbstract } from './BaseNotionServiceAbstract';
import { NotionResponse } from '../types';

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
