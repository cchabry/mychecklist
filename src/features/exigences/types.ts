
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

// Re-export des types déjà définis ailleurs si nécessaire
// export * from '@/types/domain';
