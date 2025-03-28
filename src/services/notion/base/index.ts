
/**
 * Exporte les classes de base et les interfaces pour les services standardisés
 * 
 * Ce module centralise les définitions des classes et interfaces de base
 * utilisées par tous les services Notion pour assurer une implémentation cohérente.
 */

export { 
  BaseNotionService,
  generateMockId,
  type StandardFilterOptions,
  type CrudService,
  type ServiceResponse
} from './BaseNotionService';

/**
 * Interface pour un service CRUD générique
 * 
 * @template T - Type de l'entité gérée par le service
 * @template C - Type pour la création d'une entité
 * @template U - Type pour la mise à jour d'une entité
 * @template F - Type pour les options de filtrage
 */
export interface GenericCrudService<T, C = Omit<T, 'id'>, U = Partial<T>, F = StandardFilterOptions> {
  /** Récupère toutes les entités */
  getAll(filters?: F): Promise<T[]>;
  /** Récupère une entité par son ID */
  getById(id: string): Promise<T | null>;
  /** Crée une nouvelle entité */
  create(data: C): Promise<T>;
  /** Met à jour une entité existante */
  update(id: string, data: U): Promise<T>;
  /** Supprime une entité */
  delete(id: string): Promise<boolean>;
}
