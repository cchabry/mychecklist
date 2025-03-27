
/**
 * Implémentation de l'API des items de checklist
 */

import { ChecklistApi } from '@/types/api/domain';
import { ChecklistItem } from '@/types/domain';
import { checklistService } from '../checklistService';
import { FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR, NOT_FOUND_ERROR, VALIDATION_ERROR } from '@/constants/errorMessages';

export class NotionChecklistApi implements ChecklistApi {
  async getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await checklistService.getChecklistItems();
    if (!response.success) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    return response.data || [];
  }
  
  async getChecklistItemById(id: string): Promise<ChecklistItem> {
    const response = await checklistService.getChecklistItemById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `${NOT_FOUND_ERROR}: Item de checklist #${id}`);
    }
    return response.data as ChecklistItem;
  }

  async createChecklistItem(_item: Omit<ChecklistItem, 'id'>): Promise<ChecklistItem> {
    // Pour l'instant, nous retournons une implémentation simulée
    throw new Error(CREATE_ERROR + ": Méthode createChecklistItem non implémentée");
  }

  async updateChecklistItem(_item: ChecklistItem): Promise<ChecklistItem> {
    // Pour l'instant, nous retournons une implémentation simulée
    throw new Error(UPDATE_ERROR + ": Méthode updateChecklistItem non implémentée");
  }

  async deleteChecklistItem(_id: string): Promise<boolean> {
    // Pour l'instant, nous retournons une implémentation simulée
    throw new Error(DELETE_ERROR + ": Méthode deleteChecklistItem non implémentée");
  }
}

export const checklistsApi = new NotionChecklistApi();
