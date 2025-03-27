
/**
 * Types pour la feature Checklist
 */

import { ChecklistItem } from '@/types/domain/checklist';

export type { ChecklistItem };

/**
 * Type pour les filtres de checklist
 */
export interface ChecklistFilters {
  category?: string;
  subcategory?: string;
  profile?: string[];
  phase?: string[];
  priority?: string;
  effort?: string;
  search?: string;
}

/**
 * Type pour les options de tri
 */
export type ChecklistSortOption = 'priority_desc' | 'priority_asc' | 'effort_desc' | 'effort_asc' | 'category_asc' | 'category_desc';
