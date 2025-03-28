
/**
 * Service pour la gestion des items de checklist via Notion
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { ChecklistItem } from '@/types/domain';

/**
 * Service de gestion des items de checklist
 */
class ChecklistService {
  /**
   * Récupère tous les items de checklist
   */
  async getChecklistItems(): Promise<NotionResponse<ChecklistItem[]>> {
    const config = notionClient.getConfig();
    
    if (!config.checklistsDbId) {
      return { 
        success: false, 
        error: { message: "Base de données des checklists non configurée" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: this.getMockChecklistItems()
      };
    }
    
    // Interroger la base de données Notion
    const response = await notionClient.post<{results: any[]}>(`/databases/${config.checklistsDbId}/query`, {});
    
    if (!response.success || !response.data?.results) {
      return { success: false, error: response.error };
    }
    
    // Transformer les résultats Notion en items de checklist
    const items: ChecklistItem[] = response.data.results.map(page => {
      const properties = page.properties;
      
      return {
        id: page.id,
        consigne: this.extractTextProperty(properties.Consigne || properties.Title || properties.Name),
        description: this.extractTextProperty(properties.Description),
        category: this.extractSelectProperty(properties.Category || properties.Categorie),
        subcategory: this.extractSelectProperty(properties.Subcategory || properties.SousCategorie),
        reference: this.extractMultiSelectProperty(properties.Reference || properties.References),
        profil: this.extractMultiSelectProperty(properties.Profil || properties.Profils),
        phase: this.extractMultiSelectProperty(properties.Phase || properties.Phases),
        effort: properties.Effort?.number || 3,
        priority: properties.Priority?.number || properties.Priorite?.number || 3
      };
    });
    
    return {
      success: true,
      data: items
    };
  }
  
  /**
   * Récupère un item de checklist par son ID
   */
  async getChecklistItemById(id: string): Promise<NotionResponse<ChecklistItem>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockItems = this.getMockChecklistItems();
      const item = mockItems.find(item => item.id === id);
      
      if (!item) {
        return { 
          success: false, 
          error: { message: `Item de checklist #${id} non trouvé` } 
        };
      }
      
      return {
        success: true,
        data: item
      };
    }
    
    // Récupérer les détails de la page depuis Notion
    const response = await notionClient.get<any>(`/pages/${id}`);
    
    if (!response.success || !response.data) {
      return response as NotionResponse<ChecklistItem>;
    }
    
    const page = response.data;
    const properties = page.properties;
    
    const item: ChecklistItem = {
      id: page.id,
      consigne: this.extractTextProperty(properties.Consigne || properties.Title || properties.Name),
      description: this.extractTextProperty(properties.Description),
      category: this.extractSelectProperty(properties.Category || properties.Categorie),
      subcategory: this.extractSelectProperty(properties.Subcategory || properties.SousCategorie),
      reference: this.extractMultiSelectProperty(properties.Reference || properties.References),
      profil: this.extractMultiSelectProperty(properties.Profil || properties.Profils),
      phase: this.extractMultiSelectProperty(properties.Phase || properties.Phases),
      effort: properties.Effort?.number || 3,
      priority: properties.Priority?.number || properties.Priorite?.number || 3
    };
    
    return {
      success: true,
      data: item
    };
  }
  
  /**
   * Génère des items de checklist fictifs pour le mode démo
   */
  private getMockChecklistItems(): ChecklistItem[] {
    return [
      {
        id: 'check-1',
        consigne: 'Utiliser des textes alternatifs pour les images',
        description: 'Toutes les images doivent avoir un attribut alt décrivant leur contenu',
        category: 'Accessibilité',
        subcategory: 'Images',
        reference: ['RGAA 1.1', 'WCAG 1.1.1'],
        profil: ['Développeur', 'Contributeur'],
        phase: ['Développement', 'Production'],
        effort: 2,
        priority: 4
      },
      {
        id: 'check-2',
        consigne: 'Optimiser les images pour le web',
        description: 'Les images doivent être compressées et dans un format adapté au web',
        category: 'Performance',
        subcategory: 'Médias',
        reference: ['RGESN 4.2'],
        profil: ['UI designer', 'Développeur'],
        phase: ['Design', 'Développement'],
        effort: 3,
        priority: 3
      },
      {
        id: 'check-3',
        consigne: 'Contraste suffisant pour le texte',
        description: 'Le texte doit avoir un contraste suffisant par rapport à son arrière-plan',
        category: 'Accessibilité',
        subcategory: 'Contenu',
        reference: ['RGAA 3.2', 'WCAG 1.4.3'],
        profil: ['UI designer'],
        phase: ['Design'],
        effort: 2,
        priority: 5
      }
    ];
  }
  
  /**
   * Utilitaire pour extraire le texte d'une propriété Notion
   */
  private extractTextProperty(property: any): string {
    if (!property) return '';
    
    if (property.title && Array.isArray(property.title)) {
      return property.title.map((t: any) => t.plain_text || '').join('');
    }
    
    if (property.rich_text && Array.isArray(property.rich_text)) {
      return property.rich_text.map((t: any) => t.plain_text || '').join('');
    }
    
    return '';
  }
  
  /**
   * Utilitaire pour extraire une propriété select de Notion
   */
  private extractSelectProperty(property: any): string {
    if (!property || !property.select) return '';
    return property.select.name || '';
  }
  
  /**
   * Utilitaire pour extraire une propriété multi_select de Notion
   */
  private extractMultiSelectProperty(property: any): string[] {
    if (!property || !property.multi_select || !Array.isArray(property.multi_select)) {
      return [];
    }
    
    return property.multi_select.map((item: any) => item.name || '');
  }
}

// Créer et exporter une instance singleton
export const checklistService = new ChecklistService();

// Export par défaut
export default checklistService;
