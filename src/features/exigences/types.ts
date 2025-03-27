
/**
 * Types pour le module des exigences
 * 
 * Ce module définit les types et interfaces utilisés dans la feature
 * de gestion des exigences, qui associent les items de checklist aux
 * projets avec un niveau d'importance spécifique.
 */

import { ImportanceLevel } from '@/types/enums';
import { ChecklistItem } from '@/types/domain';

/**
 * Options de tri pour les exigences
 */
export type ExigenceSortOption = 
  | 'importance_desc' 
  | 'importance_asc' 
  | 'category_asc' 
  | 'category_desc';

/**
 * Filtres pour la recherche et l'affichage des exigences
 */
export interface ExigenceFilters {
  /** Terme de recherche pour filtrer par texte */
  search?: string;
  /** Filtrer par niveau d'importance */
  importance?: ImportanceLevel;
  /** Filtrer par catégorie */
  category?: string;
  /** Filtrer par sous-catégorie */
  subCategory?: string;
}

/**
 * Statistiques sur les exigences
 */
export interface ExigenceStat {
  /** Nombre total d'exigences */
  total: number;
  /** Distribution par niveau d'importance */
  byImportance: Record<ImportanceLevel, number>;
}

// Re-export des types du domaine pour la cohérence d'API
// Note: Nous utilisons `export type` pour être compatible avec isolatedModules
export type { Exigence } from '@/types/domain';

/**
 * Exigence enrichie avec les informations de l'item de checklist associé
 */
export interface ExigenceWithItem {
  /** Identifiant unique de l'exigence */
  id: string;
  /** Identifiant du projet auquel cette exigence appartient */
  projectId: string;
  /** Identifiant de l'item de checklist associé */
  itemId: string;
  /** Niveau d'importance de cette exigence pour le projet */
  importance: ImportanceLevel;
  /** Commentaire ou précisions sur cette exigence */
  comment: string;
  /** Item de checklist associé avec toutes ses informations */
  checklistItem?: ChecklistItem;
}

/**
 * Données pour créer une nouvelle exigence
 */
export interface CreateExigenceData {
  /** Identifiant du projet auquel l'exigence appartient */
  projectId: string;
  /** Identifiant de l'item de checklist associé */
  itemId: string;
  /** Niveau d'importance */
  importance: ImportanceLevel;
  /** Commentaire ou précisions */
  comment: string;
}

/**
 * Données pour mettre à jour une exigence existante
 */
export interface UpdateExigenceData {
  /** Niveau d'importance (optionnel) */
  importance?: ImportanceLevel;
  /** Commentaire ou précisions (optionnel) */
  comment?: string;
}
