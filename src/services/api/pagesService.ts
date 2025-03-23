
import { SamplePage } from '@/lib/types';
import { QueryFilters } from './types';
import { BaseServiceAbstract } from './BaseServiceAbstract';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

class PagesService extends BaseServiceAbstract<SamplePage> {
  constructor() {
    super('pages', {
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    });
  }
  
  protected async fetchById(id: string): Promise<SamplePage | null> {
    if (operationMode.isDemoMode) {
      const mockData = await import('@/lib/mockData/index').then(m => m.mockData);
      return mockData.getPage(id) || null;
    }
    
    try {
      const page = await notionApi.getSamplePage(id);
      return page;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la page ${id}:`, error);
      throw error;
    }
  }
  
  protected async fetchAll(filters?: QueryFilters): Promise<SamplePage[]> {
    if (operationMode.isDemoMode) {
      const mockData = await import('@/lib/mockData/index').then(m => m.mockData);
      
      const allPages = mockData.getPages();
      
      if (filters?.projectId) {
        return allPages.filter(page => page.projectId === filters.projectId);
      }
      
      return allPages;
    }
    
    try {
      const projectId = filters?.projectId;
      if (!projectId) {
        return [];
      }
      
      const pages = await notionApi.getSamplePages(projectId);
      return pages;
    } catch (error) {
      console.error('Erreur lors de la récupération des pages:', error);
      throw error;
    }
  }
  
  protected async createItem(data: Partial<SamplePage>): Promise<SamplePage> {
    if (operationMode.isDemoMode) {
      const newPage: SamplePage = {
        id: `page_${Date.now()}`,
        url: data.url || '',
        title: data.title || 'Nouvelle page',
        description: data.description || '',
        projectId: data.projectId || '',
        order: data.order || 0
      };
      
      return newPage;
    }
    
    try {
      if (!data.projectId || !data.url) {
        throw new Error('projectId et url sont requis pour créer une page');
      }
      
      const page = await notionApi.createSamplePage(data as SamplePage);
      
      // Invalider le cache des pages pour ce projet
      this.invalidateList();
      
      return page;
    } catch (error) {
      console.error('Erreur lors de la création de la page:', error);
      throw error;
    }
  }
  
  protected async updateItem(id: string, data: Partial<SamplePage>): Promise<SamplePage> {
    if (operationMode.isDemoMode) {
      const mockData = await import('@/lib/mockData/index').then(m => m.mockData);
      const existingPage = mockData.getPage(id);
      
      if (!existingPage) {
        throw new Error(`Page non trouvée: ${id}`);
      }
      
      const updatedPage: SamplePage = {
        ...existingPage,
        ...data
      };
      
      return updatedPage;
    }
    
    try {
      const page = await notionApi.updateSamplePage(id, data);
      return page;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la page ${id}:`, error);
      throw error;
    }
  }
  
  protected async deleteItem(id: string): Promise<boolean> {
    if (operationMode.isDemoMode) {
      return true;
    }
    
    try {
      await notionApi.deleteSamplePage(id);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la page ${id}:`, error);
      throw error;
    }
  }
  
  // Méthode spécifique pour réordonner les pages
  async reorderPages(projectId: string, pageIds: string[]): Promise<boolean> {
    if (operationMode.isDemoMode) {
      return true;
    }
    
    try {
      // Mettre à jour chaque page avec son nouvel ordre
      const updatePromises = pageIds.map((id, index) => 
        this.update(id, { order: index })
      );
      
      await Promise.all(updatePromises);
      
      // Invalider le cache
      this.invalidateList();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la réorganisation des pages:', error);
      return false;
    }
  }
}

export const pagesService = new PagesService();
