
/**
 * Interfaces pour les services Notion
 */

import { StandardFilterOptions, NotionResponse } from './ResponseTypes';

/**
 * Interface de base pour les services CRUD
 * 
 * @template T Type de l'entité
 * @template F Type des options de filtre
 * @template C Type des données pour la création
 * @template U Type des données pour la mise à jour
 */
export interface CrudService<T, F = StandardFilterOptions, C = Partial<T>, U = Partial<T>> {
  /**
   * Récupère toutes les entités selon le filtre spécifié
   * 
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  getAll(filter?: F): Promise<NotionResponse<T[]>>;
  
  /**
   * Récupère une entité par son ID
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers l'entité ou une erreur
   */
  getById(id: string): Promise<NotionResponse<T>>;
  
  /**
   * Crée une nouvelle entité
   * 
   * @param data Données pour la création
   * @returns Promise résolvant vers l'entité créée ou une erreur
   */
  create(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Met à jour une entité existante
   * 
   * @param id ID de l'entité
   * @param data Données pour la mise à jour
   * @returns Promise résolvant vers l'entité mise à jour ou une erreur
   */
  update(id: string, data: U): Promise<NotionResponse<T>>;
  
  /**
   * Supprime une entité
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers un booléen indiquant le succès ou une erreur
   */
  delete(id: string): Promise<NotionResponse<boolean>>;
}

/**
 * Interface pour les services d'entités enfant
 * 
 * @template T Type de l'entité
 * @template P Type de l'entité parente
 * @template F Type des options de filtre
 */
export interface ChildEntityService<T, P, F = StandardFilterOptions> {
  /**
   * Récupère toutes les entités enfant pour une entité parente
   * 
   * @param parentId ID de l'entité parente
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  getAllForParent(parentId: string, filter?: F): Promise<NotionResponse<T[]>>;
  
  /**
   * Récupère une entité enfant spécifique pour une entité parente
   * 
   * @param parentId ID de l'entité parente
   * @param childId ID de l'entité enfant
   * @returns Promise résolvant vers l'entité ou une erreur
   */
  getByIdForParent(parentId: string, childId: string): Promise<NotionResponse<T>>;
}

/**
 * Interface pour les services supportant des opérations par lots
 * 
 * @template T Type de l'entité
 */
export interface BatchService<T> {
  /**
   * Crée plusieurs entités en une seule opération
   * 
   * @param items Entités à créer
   * @returns Promise résolvant vers les entités créées ou une erreur
   */
  createBatch(items: Partial<T>[]): Promise<NotionResponse<T[]>>;
  
  /**
   * Met à jour plusieurs entités en une seule opération
   * 
   * @param items Entités à mettre à jour (doit inclure l'ID)
   * @returns Promise résolvant vers les entités mises à jour ou une erreur
   */
  updateBatch(items: T[]): Promise<NotionResponse<T[]>>;
  
  /**
   * Supprime plusieurs entités en une seule opération
   * 
   * @param ids IDs des entités à supprimer
   * @returns Promise résolvant vers un booléen indiquant le succès ou une erreur
   */
  deleteBatch(ids: string[]): Promise<NotionResponse<boolean>>;
}
