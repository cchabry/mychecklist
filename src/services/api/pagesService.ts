
import { SamplePage } from '@/lib/types';
import { BaseService } from './baseService';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';

/**
 * Service pour la gestion des pages d'échantillon
 */
export class PagesService extends BaseService<SamplePage> {
  constructor() {
    super('pages', {
      cacheTTL: 15 * 60 * 1000, // 15 minutes
    });
  }
  
  /**
   * Récupère une page par son ID
   */
  protected async fetchById(id: string): Promise<SamplePage | null> {
    try {
      return await notionApi.getSamplePage(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la page #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère toutes les pages
   */
  protected async fetchAll(filters?: QueryFilters): Promise<SamplePage[]> {
    try {
      const pages = await notionApi.getSamplePages();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(pages, filters);
      }
      
      return pages;
    } catch (error) {
      console.error('Erreur lors de la récupération des pages:', error);
      return [];
    }
  }
  
  /**
   * Crée une nouvelle page
   */
  protected async createItem(data: Partial<SamplePage>): Promise<SamplePage> {
    if (!data.projectId) {
      throw new Error('L\'ID du projet est requis');
    }
    
    if (!data.url) {
      throw new Error('L\'URL de la page est requise');
    }
    
    return await notionApi.createSamplePage({
      projectId: data.projectId,
      url: data.url,
      title: data.title || '',
      description: data.description || '',
      order: data.order || 0,
      ...data
    });
  }
  
  /**
   * Met à jour une page existante
   */
  protected async updateItem(id: string, data: Partial<SamplePage>): Promise<SamplePage> {
    const existingPage = await this.fetchById(id);
    
    if (!existingPage) {
      throw new Error(`Page #${id} non trouvée`);
    }
    
    return await notionApi.updateSamplePage(id, {
      ...existingPage,
      ...data,
      id // S'assurer que l'ID reste inchangé
    });
  }
  
  /**
   * Supprime une page
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteSamplePage(id);
  }
  
  /**
   * Récupère les pages pour un projet spécifique
   */
  async getByProject(projectId: string): Promise<SamplePage[]> {
    return this.getAll(undefined, { projectId });
  }
  
  /**
   * Réorganise l'ordre des pages
   */
  async reorderPages(projectId: string, newOrder: string[]): Promise<boolean> {
    try {
      const pages = await this.getByProject(projectId);
      
      // Mettre à jour l'ordre de chaque page
      const updatePromises = newOrder.map((id, index) => {
        const page = pages.find(p => p.id === id);
        if (page) {
          return this.update(id, { order: index });
        }
        return Promise.resolve(null);
      });
      
      await Promise.all(updatePromises);
      
      // Invalider les caches
      this.invalidateList();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la réorganisation des pages:', error);
      return false;
    }
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux pages
   */
  private applyFilters(pages: SamplePage[], filters: QueryFilters): SamplePage[] {
    return pages.filter(page => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const pageValue = page[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(pageValue);
        }
        
        return pageValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const pagesService = new PagesService();
