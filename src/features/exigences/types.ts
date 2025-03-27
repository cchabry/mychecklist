
import { ImportanceLevel } from '@/types/enums';
import { Exigence } from '@/types/domain';
import { ChecklistItem } from '@/types/domain';

// Enrichissement d'une exigence avec son item de checklist associé
export interface ExigenceWithItem extends Exigence {
  checklistItem?: ChecklistItem;
}

// Options de tri des exigences
export type ExigenceSortOption = 'importance_desc' | 'importance_asc' | 'category_asc' | 'category_desc';

// Filtres pour les exigences
export interface ExigenceFilters {
  search: string;
  category?: string;
  subCategory?: string;
  importance?: ImportanceLevel;
}

// Statistiques des exigences
export interface ExigenceStat {
  total: number;
  byImportance: Record<ImportanceLevel, number>;
}

// Types pour la création et la mise à jour d'exigences
export interface CreateExigenceData {
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}

export interface UpdateExigenceData {
  importance?: ImportanceLevel;
  comment?: string;
}

// Re-export du type Exigence pour simplifier les imports
export { Exigence } from '@/types/domain';
