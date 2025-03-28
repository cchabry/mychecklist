
/**
 * Types pour les services de base
 */

/**
 * Options standard pour le filtrage des entités
 */
export interface StandardFilterOptions<T = any> {
  filter?: (entity: T) => boolean;
  sort?: (a: T, b: T) => number;
  limit?: number;
  projectId?: string; // Ajouté pour supporter les filtrages par projet
}

/**
 * Interface CRUD commune pour tous les services
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création (Create)
 * @template U - Type pour la mise à jour (Update)
 * @template ID - Type d'identifiant
 */
export interface CrudService<T, C, U, ID = string> {
  getAll(options?: StandardFilterOptions<T>): Promise<any>;
  getById(id: ID): Promise<any>;
  create(data: C): Promise<any>;
  update(entity: U): Promise<any>;
  delete(id: ID): Promise<any>;
}
