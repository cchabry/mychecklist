
/**
 * Options de filtrage standard pour les requêtes
 * 
 * @template T - Type d'entité à filtrer
 */
export interface StandardFilterOptions<T = any> {
  /** Fonction de filtrage personnalisée */
  filter?: (item: T) => boolean;
  /** ID du projet pour filtrer les entités liées à un projet spécifique */
  projectId?: string;
  /** Nombre maximal d'éléments à retourner */
  limit?: number;
  /** Trier les résultats par cette propriété */
  sortBy?: keyof T;
  /** Ordre de tri (ascendant ou descendant) */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface CRUD de base pour les services
 * 
 * @template T - Type d'entité principale
 * @template C - Type pour la création
 * @template U - Type pour la mise à jour
 * @template ID - Type d'identifiant
 */
export interface CrudService<T, C, U, ID = string> {
  /** Récupère toutes les entités */
  getAll(options?: StandardFilterOptions<T>): Promise<T[]>;
  /** Récupère une entité par son ID */
  getById(id: ID): Promise<T>;
  /** Crée une nouvelle entité */
  create(data: C): Promise<T>;
  /** Met à jour une entité existante */
  update(entity: U): Promise<T>;
  /** Supprime une entité */
  delete(id: ID): Promise<boolean>;
}
