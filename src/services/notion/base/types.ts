
import { NotionResponse, NotionConfig } from '../types';

/**
 * Type pour les options de filtrage standard
 */
export interface StandardFilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Interface pour un service CRUD de base
 */
export interface CrudService<T, C = Omit<T, 'id'>, U = T, ID = string> {
  getAll(filter?: Record<string, any>): Promise<NotionResponse<T[]>>;
  getById(id: ID): Promise<NotionResponse<T>>;
  create(data: C): Promise<NotionResponse<T>>;
  update(entity: U): Promise<NotionResponse<T>>;
  delete(id: ID): Promise<NotionResponse<boolean>>;
}
