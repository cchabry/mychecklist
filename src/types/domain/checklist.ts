
/**
 * Types pour le domaine Checklist
 */

/**
 * Item de checklist représentant une bonne pratique
 */
export interface ChecklistItem {
  /** Identifiant unique */
  id: string;
  /** Titre de l'item */
  title: string;
  /** Description détaillée */
  description: string;
  /** Catégorie principale */
  category: string;
  /** Sous-catégorie (optionnelle) */
  subcategory?: string;
  /** Références externes (optionnelles) */
  reference?: string[];
  /** Profils d'utilisateur concernés (optionnels) */
  profil?: string[];
  /** Phases du projet concernées (optionnelles) */
  phase?: string[];
  /** Niveau d'effort requis */
  effort: string;
  /** Niveau de priorité */
  priority: string;
}

/**
 * Critère de filtre pour les items de checklist
 */
export interface ChecklistItemFilter {
  /** Filtrer par catégorie */
  category?: string;
  /** Filtrer par sous-catégorie */
  subcategory?: string;
  /** Recherche textuelle */
  search?: string;
  /** Filtrer par phase */
  phase?: string;
  /** Filtrer par profil */
  profil?: string;
}
