
/**
 * Types pour la feature Exigences
 */

import { ChecklistItem } from '../checklist/types';
import { ImportanceLevel } from '@/types/enums';

// Re-export avec 'export type' pour isolatedModules
export type { Exigence } from '@/types/domain';

/**
 * Type pour les filtres d'exigences
 */
export interface ExigenceFilters {
  importance?: ImportanceLevel;
  search?: string;
  category?: string;
  subCategory?: string;
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

/**
 * Type pour une exigence avec son item de checklist associé
 */
export interface ExigenceWithItem {
  exigence: import('@/types/domain').Exigence;
  item: ChecklistItem;
}
