
/**
 * Implémentation de l'API des items de checklist
 */

import { ChecklistApi } from '@/types/api/domain';
import { ChecklistItem } from '@/types/domain';
import { checklistService } from '../checklistService';

export class NotionChecklistApi implements ChecklistApi {
  async getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await checklistService.getChecklistItems();
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des items de checklist");
    }
    return response.data || [];
  }
  
  async getChecklistItemById(id: string): Promise<ChecklistItem> {
    const response = await checklistService.getChecklistItemById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Item de checklist #${id} non trouvé`);
    }
    return response.data as ChecklistItem;
  }
}

export const checklistsApi = new NotionChecklistApi();
