
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

  async createChecklistItem(item: Omit<ChecklistItem, 'id'>): Promise<ChecklistItem> {
    // Pour l'instant, nous retournons une implémentation simulée
    // Cette méthode devra être complétée lors de l'implémentation du service correspondant
    throw new Error("Méthode createChecklistItem non implémentée");
  }

  async updateChecklistItem(item: ChecklistItem): Promise<ChecklistItem> {
    // Pour l'instant, nous retournons une implémentation simulée
    // Cette méthode devra être complétée lors de l'implémentation du service correspondant
    throw new Error("Méthode updateChecklistItem non implémentée");
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    // Pour l'instant, nous retournons une implémentation simulée
    // Cette méthode devra être complétée lors de l'implémentation du service correspondant
    throw new Error("Méthode deleteChecklistItem non implémentée");
  }
}

export const checklistsApi = new NotionChecklistApi();
