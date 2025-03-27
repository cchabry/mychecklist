
/**
 * Interface pour l'API des items de checklist
 */

import { ChecklistItem } from '@/types/domain';

export interface ChecklistApi {
  getChecklistItems(): Promise<ChecklistItem[]>;
  getChecklistItemById(id: string): Promise<ChecklistItem>;
  createChecklistItem(item: Omit<ChecklistItem, 'id'>): Promise<ChecklistItem>;
  updateChecklistItem(item: ChecklistItem): Promise<ChecklistItem>;
  deleteChecklistItem(id: string): Promise<boolean>;
}
