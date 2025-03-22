
import { ChecklistItem } from '@/lib/types';
import { notionClient, NotionAPIListResponse, NotionAPIPage } from './client';
import { cacheService } from '../cache';

// Clés de cache pour les items de la checklist
const CHECKLIST_CACHE_KEY = 'notion_checklist';
const CHECKLIST_ITEM_PREFIX = 'notion_checklist_item_';
const CHECKLIST_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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
      const cachedItems = cacheService.get<ChecklistItem[]>(CHECKLIST_CACHE_KEY);
      if (cachedItems) {
        console.log('Items de checklist récupérés depuis le cache');
        return cachedItems;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      const checklistDbId = localStorage.getItem('notion_checklist_database_id');
      if (!checklistDbId) {
        throw new Error('ID de base de données de checklist Notion manquant');
      }
      
      // Faire la requête à l'API Notion
      const response = await notionClient.post<NotionAPIListResponse>(`/databases/${checklistDbId}/query`, {});
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la récupération des items de checklist');
      }
      
      // Mapper les résultats en items de checklist
      const items = response.data.results.map((page: any) => {
        const properties = page.properties;
        
        // Fonction utilitaire pour extraire un tableau de valeurs depuis une propriété multi-select ou multi-rich_text
        const extractMultiValues = (prop: any, valueKey: string = 'name'): string[] => {
          if (!prop) return [];
          if (Array.isArray(prop)) return prop.map((item: any) => item[valueKey] || '');
          if (prop.multi_select) return prop.multi_select.map((item: any) => item.name || '');
          if (prop.rich_text) return prop.rich_text.map((item: any) => item.plain_text || '');
          return [];
        };
        
        // Extraire les valeurs depuis les propriétés Notion
        const consigne = properties.Consigne?.title?.[0]?.plain_text || 
                          properties.consigne?.title?.[0]?.plain_text || 
                          properties.Title?.title?.[0]?.plain_text || 
                          properties.title?.title?.[0]?.plain_text || '';
                          
        const description = properties.Description?.rich_text?.[0]?.plain_text || 
                           properties.description?.rich_text?.[0]?.plain_text || '';
                           
        const category = properties.Category?.select?.name || 
                        properties.category?.select?.name || 
                        properties.Categorie?.select?.name || '';
                        
        const subcategory = properties.Subcategory?.select?.name || 
                           properties.subcategory?.select?.name || 
                           properties.SousCategorie?.select?.name || '';
                           
        const reference = extractMultiValues(properties.Reference?.multi_select || 
                                           properties.reference?.multi_select || 
                                           properties.References?.multi_select);
                                           
        const profil = extractMultiValues(properties.Profil?.multi_select || 
                                        properties.profil?.multi_select || 
                                        properties.Profiles?.multi_select);
                                        
        const phase = extractMultiValues(properties.Phase?.multi_select || 
                                       properties.phase?.multi_select);
                                       
        const effort = properties.Effort?.select?.name || 
                      properties.effort?.select?.name || 'Moyen';
                      
        const priority = properties.Priority?.select?.name || 
                        properties.priority?.select?.name || 
                        properties.Priorite?.select?.name || 'Moyenne';
        
        // Créer l'item de checklist avec les propriétés requises
        return {
          id: page.id,
          title: consigne, // Map consigne to title for compatibility
          description: description,
          category: category,
          subcategory: subcategory,
          consigne: consigne,
          reference: reference.join(', '), // Join array to string for compatibility
          profil: profil.join(', '), // Join array to string for compatibility
          phase: phase.join(', '), // Join array to string for compatibility
          effort: effort,
          priority: priority
        };
      });
      
      // Sauvegarder dans le cache
      cacheService.set(CHECKLIST_CACHE_KEY, items, CHECKLIST_CACHE_TTL);
      
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
      const cachedItem = cacheService.get<ChecklistItem>(`${CHECKLIST_ITEM_PREFIX}${id}`);
      if (cachedItem) {
        console.log(`Item de checklist ${id} récupéré depuis le cache`);
        return cachedItem;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Faire la requête à l'API Notion
      const response = await notionClient.get<NotionAPIPage>(`/pages/${id}`);
      
      if (!response.success) {
        console.error('Erreur Notion lors de la récupération de l\'item de checklist:', response.error);
        return null;
      }
      
      const data = response.data;
      const properties = data.properties;
      
      // Fonction utilitaire pour extraire un tableau de valeurs depuis une propriété multi-select ou multi-rich_text
      const extractMultiValues = (prop: any, valueKey: string = 'name'): string[] => {
        if (!prop) return [];
        if (Array.isArray(prop)) return prop.map((item: any) => item[valueKey] || '');
        if (prop.multi_select) return prop.multi_select.map((item: any) => item.name || '');
        if (prop.rich_text) return prop.rich_text.map((item: any) => item.plain_text || '');
        return [];
      };
      
      // Extraire les valeurs depuis les propriétés Notion
      const consigne = properties.Consigne?.title?.[0]?.plain_text || 
                      properties.consigne?.title?.[0]?.plain_text || 
                      properties.Title?.title?.[0]?.plain_text || 
                      properties.title?.title?.[0]?.plain_text || '';
                        
      const description = properties.Description?.rich_text?.[0]?.plain_text || 
                         properties.description?.rich_text?.[0]?.plain_text || '';
                         
      const category = properties.Category?.select?.name || 
                      properties.category?.select?.name || 
                      properties.Categorie?.select?.name || '';
                      
      const subcategory = properties.Subcategory?.select?.name || 
                         properties.subcategory?.select?.name || 
                         properties.SousCategorie?.select?.name || '';
                         
      const reference = extractMultiValues(properties.Reference?.multi_select || 
                                         properties.reference?.multi_select || 
                                         properties.References?.multi_select);
                                         
      const profil = extractMultiValues(properties.Profil?.multi_select || 
                                      properties.profil?.multi_select || 
                                      properties.Profiles?.multi_select);
                                      
      const phase = extractMultiValues(properties.Phase?.multi_select || 
                                     properties.phase?.multi_select);
                                     
      const effort = properties.Effort?.select?.name || 
                    properties.effort?.select?.name || 'Moyen';
                    
      const priority = properties.Priority?.select?.name || 
                      properties.priority?.select?.name || 
                      properties.Priorite?.select?.name || 'Moyenne';
      
      // Créer l'item de checklist avec les propriétés requises
      const item: ChecklistItem = {
        id: data.id,
        title: consigne, // Map consigne to title for compatibility
        description: description,
        category: category,
        subcategory: subcategory,
        consigne: consigne,
        reference: reference.join(', '), // Join array to string for compatibility
        profil: profil.join(', '), // Join array to string for compatibility
        phase: phase.join(', '), // Join array to string for compatibility
        effort: effort,
        priority: priority
      };
      
      // Sauvegarder dans le cache
      cacheService.set(`${CHECKLIST_ITEM_PREFIX}${id}`, item, CHECKLIST_CACHE_TTL);
      
      return item;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'item de checklist ${id}:`, error);
      return null;
    }
  }
};
