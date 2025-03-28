
/**
 * Interfaces communes pour les services Notion
 * 
 * Ce module définit les contrats que tous les services de domaine Notion
 * doivent respecter, afin d'assurer une cohérence dans l'application.
 */

import { NotionResponse } from '../types';

/**
 * Interface de base pour les services CRUD
 * 
 * Cette interface définit les opérations standard que tous les
 * services de domaine doivent implémenter.
 * 
 * @template T - Type de l'entité gérée par le service
 * @template F - Type des filtres (optionnel)
 * @template C - Type des données de création
 * @template U - Type des données de mise à jour
 */
export interface CrudService<T, F = unknown, C = Partial<T>, U = Partial<T>> {
  /**
   * Récupère toutes les entités, éventuellement filtrées
   */
  getAll(filters?: F): Promise<NotionResponse<T[]>>;
  
  /**
   * Récupère une entité par son identifiant
   */
  getById(id: string): Promise<NotionResponse<T>>;
  
  /**
   * Crée une nouvelle entité
   */
  create(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Met à jour une entité existante
   */
  update(id: string, data: U): Promise<NotionResponse<T>>;
  
  /**
   * Supprime une entité
   */
  delete(id: string): Promise<NotionResponse<boolean>>;
}

/**
 * Interface pour les services avec des opérations liées à un parent
 * 
 * Cette interface étend l'interface CrudService pour les entités
 * qui ont une relation parent-enfant.
 * 
 * @template T - Type de l'entité enfant
 * @template P - Type de l'identifiant du parent
 * @template F - Type des filtres (optionnel)
 * @template C - Type des données de création
 * @template U - Type des données de mise à jour
 */
export interface ChildEntityService<T, P = string, F = unknown, C = Partial<T>, U = Partial<T>> 
  extends CrudService<T, F, C, U> {
  
  /**
   * Récupère toutes les entités liées à un parent
   */
  getAllByParent(parentId: P, filters?: F): Promise<NotionResponse<T[]>>;
}

/**
 * Interface spécifique pour les services avec des opérations de batch
 * 
 * Cette interface étend l'interface de base pour les services
 * qui nécessitent des opérations par lots.
 * 
 * @template T - Type de l'entité gérée par le service
 * @template F - Type des filtres (optionnel)
 * @template C - Type des données de création
 * @template U - Type des données de mise à jour
 */
export interface BatchService<T, F = unknown, C = Partial<T>, U = Partial<T>> 
  extends CrudService<T, F, C, U> {
  
  /**
   * Crée plusieurs entités en une seule opération
   */
  createBatch(items: C[]): Promise<NotionResponse<T[]>>;
  
  /**
   * Met à jour plusieurs entités en une seule opération
   */
  updateBatch(items: Array<{ id: string; data: U }>): Promise<NotionResponse<T[]>>;
  
  /**
   * Supprime plusieurs entités en une seule opération
   */
  deleteBatch(ids: string[]): Promise<NotionResponse<boolean>>;
}
