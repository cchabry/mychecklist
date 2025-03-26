
/**
 * Interface pour l'API des items de checklist
 */

import { ChecklistItem } from '@/types/domain';

export interface ChecklistApi {
  getChecklistItems(): Promise<ChecklistItem[]>;
  getChecklistItemById(id: string): Promise<ChecklistItem>;
}
