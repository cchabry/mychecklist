
/**
 * Types pour la feature Checklist
 */

/**
 * Type pour les items de checklist
 */
export interface ChecklistItem {
  /** Identifiant unique de l'item */
  id: string;
  /** Nom court de l'item */
  name: string;
  /** Consigne ou titre de l'item */
  consigne: string;
  /** Description détaillée de l'item */
  description: string;
  /** Catégorie principale de l'item */
  category: string;
  /** Sous-catégorie de l'item */
  subcategory: string;
  /** Références à des règles de référentiels externes */
  reference: string[];
  /** Profils concernés par cet item */
  profil: string[];
  /** Phases du projet concernées */
  phase: string[];
  /** Niveau d'effort (1-5) */
  effort: number;
  /** Niveau de priorité (1-5) */
  priority: number;
}

/**
 * Type pour les filtres de checklist
 */
export interface ChecklistFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  effort?: string;
}

/**
 * Type pour les options de tri
 */
export type ChecklistSortOption = 
  | 'consigne_asc' 
  | 'consigne_desc' 
  | 'category_asc' 
  | 'category_desc' 
  | 'priority_asc' 
  | 'priority_desc' 
  | 'effort_asc' 
  | 'effort_desc';
