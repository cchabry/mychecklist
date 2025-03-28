
/**
 * Mappers pour les items de checklist
 */
import { ChecklistItem } from '@/types/domain';
import { v4 as uuidv4 } from 'uuid';

export const checklistMappers = {
  /**
   * Convertit une page Notion en un objet ChecklistItem
   */
  notionPageToChecklistItem(page: any): ChecklistItem {
    // Extraire les propriétés de la page Notion
    const properties = page.properties || {};
    
    // Extraire et formater les valeurs
    const name = properties.Name?.title?.map((t: any) => t.plain_text).join('') || '';
    const consigne = properties.Consigne?.rich_text?.map((t: any) => t.plain_text).join('') || '';
    const description = properties.Description?.rich_text?.map((t: any) => t.plain_text).join('') || '';
    const category = properties.Category?.select?.name || '';
    const subcategory = properties.Subcategory?.select?.name || '';
    
    // Gérer les propriétés multi-valeurs
    const reference = properties.Reference?.multi_select?.map((item: any) => item.name) || [];
    const profil = properties.Profil?.multi_select?.map((item: any) => item.name) || [];
    const phase = properties.Phase?.multi_select?.map((item: any) => item.name) || [];
    
    // Valeurs numériques
    const effort = properties.Effort?.number || 1;
    const priority = properties.Priority?.number || 1;
    
    return {
      id: page.id,
      name,
      consigne,
      description,
      category,
      subcategory,
      reference,
      profil,
      phase,
      effort,
      priority
    };
  },
  
  /**
   * Crée un ChecklistItem fictif pour les tests et démonstrations
   */
  createMockChecklistItem(id: string): ChecklistItem {
    return {
      id,
      name: `Item de test ${id}`,
      consigne: `Consigne pour l'item ${id}`,
      description: `Description détaillée pour l'item de test ${id}`,
      category: 'Test',
      subcategory: 'Mock',
      reference: ['REF-1', 'REF-2'],
      profil: ['Testeur'],
      phase: ['Test'],
      effort: 2,
      priority: 3
    };
  }
};

export default checklistMappers;
