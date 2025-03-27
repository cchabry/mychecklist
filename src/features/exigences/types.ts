
/**
 * Types pour la feature Exigences
 */

import { Exigence as DomainExigence, ChecklistItem } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';

export type Exigence = DomainExigence;

/**
 * Type pour les filtres d'exigences
 */
export interface ExigenceFilters {
  importance?: ImportanceLevel;
  category?: string;
  subcategory?: string;
  search?: string;
}

/**
 * Type pour les options de tri
 */
export type ExigenceSortOption = 'importance_desc' | 'importance_asc' | 'category_asc' | 'category_desc';

/**
 * Type pour l'exigence avec les informations de l'item de checklist associé
 */
export interface ExigenceWithItem extends Exigence {
  checklistItem: ChecklistItem;
}

/**
 * Type pour la création d'une exigence
 */
export type CreateExigenceData = {
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
};

/**
 * Type pour la mise à jour d'une exigence
 */
export type UpdateExigenceData = {
  importance?: ImportanceLevel;
  comment?: string;
};
