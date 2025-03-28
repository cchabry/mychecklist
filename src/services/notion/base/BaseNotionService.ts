
/**
 * Classe de service Notion de base qui implémente l'interface CrudService
 * en étendant BaseServiceCombined
 */

import { BaseServiceCombined } from './BaseServiceCombined';
import { NotionResponse } from '../types';
import { StandardFilterOptions } from './types';

/**
 * Classe abstraite qui permet d'implémenter un service Notion
 * en fournissant les méthodes abstraites nécessaires
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création
 * @template U - Type pour la mise à jour
 * @template ID - Type d'identifiant
 */
export abstract class BaseNotionService<T, C, U, ID = string> extends BaseServiceCombined<T, C, U, ID> {
  // Cette classe doit implémenter les méthodes abstraites de BaseServiceCombined
  protected abstract getAllImpl(options?: StandardFilterOptions<T>): Promise<NotionResponse<T[]>>;
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}
