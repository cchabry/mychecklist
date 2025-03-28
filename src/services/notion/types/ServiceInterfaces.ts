
/**
 * Interfaces pour les services Notion
 */

import { NotionResponse } from './ResponseTypes';

/**
 * Configuration pour les options de filtre standard
 */
export interface StandardFilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Interface de base pour les services CRUD
 */
export interface CrudService<T, CreateDataType = Omit<T, 'id'>, UpdateDataType = Partial<Omit<T, 'id'>>> {
  /**
   * Récupère toutes les entités
   */
  getAll(filter?: StandardFilterOptions): Promise<NotionResponse<T[]>>;

  /**
   * Récupère une entité par son ID
   */
  getById(id: string): Promise<NotionResponse<T>>;

  /**
   * Crée une nouvelle entité
   */
  create(data: CreateDataType): Promise<NotionResponse<T>>;

  /**
   * Met à jour une entité existante
   */
  update(id: string, data: UpdateDataType): Promise<NotionResponse<T>>;

  /**
   * Supprime une entité existante
   */
  delete(id: string): Promise<NotionResponse<boolean>>;
}

/**
 * Interface pour les opérations de base sur une base de données Notion
 */
export interface NotionDatabaseOperations<T> {
  /**
   * Recherche des enregistrements dans une base de données
   */
  queryDatabase(databaseId: string, filter?: any): Promise<NotionResponse<T[]>>;

  /**
   * Récupère un enregistrement par son ID
   */
  retrievePage(pageId: string): Promise<NotionResponse<T>>;

  /**
   * Crée un nouvel enregistrement dans une base de données
   */
  createPage<P = any>(databaseId: string, properties: P): Promise<NotionResponse<T>>;

  /**
   * Met à jour un enregistrement existant
   */
  updatePage<P = any>(pageId: string, properties: P): Promise<NotionResponse<T>>;

  /**
   * Supprime un enregistrement (archive la page)
   */
  archivePage(pageId: string): Promise<NotionResponse<boolean>>;
}
