
import { ChecklistItem } from '@/lib/types';
import { cacheService } from '../../cache';
import { CHECKLIST_CACHE } from './types';
import { mapNotionToChecklistItem } from './mappers';
import { fetchAllChecklistItems, fetchChecklistItem } from './api';

/**
 * Service de gestion du référentiel de bonnes pratiques (checklist) via Notion
 */
export const checklistService = {
  /**
   * Récupère tous les items de la checklist depuis Notion ou le cache
   */
  async getItems(forceRefresh = false): Promise<ChecklistItem[]> {
    // Vérifier si nous avons des données en cache et si nous ne forçons pas le rafraîchissement
    if (!forceRefresh) {
      const cachedItems = cacheService.get<ChecklistItem[]>(CHECKLIST_CACHE.KEY);
      if (cachedItems) {
        console.log('Items de checklist récupérés depuis le cache');
        return cachedItems;
      }
    }
    
    try {
      const checklistDbId = localStorage.getItem('notion_checklist_database_id');
      if (!checklistDbId) {
        throw new Error('ID de base de données de checklist Notion manquant');
      }
      
      // Récupérer les données depuis l'API
      const results = await fetchAllChecklistItems(checklistDbId);
      
      // Mapper les résultats en items de checklist
      const items = results.map((page: any) => mapNotionToChecklistItem(page.id, page.properties));
      
      // Sauvegarder dans le cache
      cacheService.set(CHECKLIST_CACHE.KEY, items, CHECKLIST_CACHE.TTL);
      
      return items;
    } catch (error) {
      console.error('Erreur lors de la récupération des items de checklist:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un item de checklist par son ID
   */
  async getItem(id: string, forceRefresh = false): Promise<ChecklistItem | null> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedItem = cacheService.get<ChecklistItem>(`${CHECKLIST_CACHE.ITEM_PREFIX}${id}`);
      if (cachedItem) {
        console.log(`Item de checklist ${id} récupéré depuis le cache`);
        return cachedItem;
      }
    }
    
    try {
      // Récupérer les données depuis l'API
      const data = await fetchChecklistItem(id);
      if (!data) return null;
      
      // Transformer les données en ChecklistItem
      const item = mapNotionToChecklistItem(data.id, data.properties);
      
      // Sauvegarder dans le cache
      cacheService.set(`${CHECKLIST_CACHE.ITEM_PREFIX}${id}`, item, CHECKLIST_CACHE.TTL);
      
      return item;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'item de checklist ${id}:`, error);
      return null;
    }
  }
};
