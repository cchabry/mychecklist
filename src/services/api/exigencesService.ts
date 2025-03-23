
import { Exigence } from '@/lib/types';
import { BaseServiceAbstract } from './BaseServiceAbstract';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

class ExigencesService extends BaseServiceAbstract<Exigence> {
  constructor() {
    super('exigences', {
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    });
  }
  
  protected async fetchById(id: string): Promise<Exigence | null> {
    if (operationMode.isDemoMode) {
      const mockExigences = await import('@/lib/mockData').then(m => m.mockExigences);
      return mockExigences.find(exigence => exigence.id === id) || null;
    }
    
    try {
      const exigence = await notionApi.getExigence(id);
      return exigence;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'exigence ${id}:`, error);
      throw error;
    }
  }
  
  protected async fetchAll(filters?: { projectId?: string }): Promise<Exigence[]> {
    if (operationMode.isDemoMode) {
      const mockExigences = await import('@/lib/mockData').then(m => m.mockExigences);
      
      if (filters?.projectId) {
        return mockExigences.filter(exigence => exigence.projectId === filters.projectId);
      }
      
      return mockExigences;
    }
    
    try {
      const projectId = filters?.projectId;
      if (!projectId) {
        throw new Error('L\'ID du projet est requis pour récupérer les exigences');
      }
      
      const exigences = await notionApi.getExigences(projectId);
      return exigences;
    } catch (error) {
      console.error('Erreur lors de la récupération des exigences:', error);
      throw error;
    }
  }
  
  protected async createItem(data: Partial<Exigence>): Promise<Exigence> {
    if (operationMode.isDemoMode) {
      const newExigence: Exigence = {
        id: `exigence_${Date.now()}`,
        itemId: data.itemId || '',
        projectId: data.projectId || '',
        importance: data.importance || 'medium',
        comment: data.comment || ''
      };
      
      return newExigence;
    }
    
    try {
      if (!data.projectId || !data.itemId) {
        throw new Error('projectId et itemId sont requis pour créer une exigence');
      }
      
      const exigence = await notionApi.createExigence(data as Exigence);
      return exigence;
    } catch (error) {
      console.error('Erreur lors de la création de l\'exigence:', error);
      throw error;
    }
  }
  
  protected async updateItem(id: string, data: Partial<Exigence>): Promise<Exigence> {
    if (operationMode.isDemoMode) {
      const mockExigences = await import('@/lib/mockData').then(m => m.mockExigences);
      const exigenceIndex = mockExigences.findIndex(exigence => exigence.id === id);
      
      if (exigenceIndex === -1) {
        throw new Error(`Exigence non trouvée: ${id}`);
      }
      
      const updatedExigence: Exigence = {
        ...mockExigences[exigenceIndex],
        ...data
      };
      
      return updatedExigence;
    }
    
    try {
      const exigence = await notionApi.updateExigence(id, data);
      return exigence;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'exigence ${id}:`, error);
      throw error;
    }
  }
  
  protected async deleteItem(id: string): Promise<boolean> {
    if (operationMode.isDemoMode) {
      return true;
    }
    
    try {
      await notionApi.deleteExigence(id);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'exigence ${id}:`, error);
      throw error;
    }
  }
  
  // Méthode spécifique pour mettre à jour les exigences par lot
  async updateBulkExigences(projectId: string, exigences: Exigence[]): Promise<Exigence[]> {
    if (operationMode.isDemoMode) {
      return exigences;
    }
    
    try {
      // Mettre à jour les exigences existantes
      const updatePromises = exigences
        .filter(exigence => exigence.id) // Filtrer celles qui ont un ID (existantes)
        .map(exigence => this.update(exigence.id, exigence));
      
      // Créer les nouvelles exigences
      const createPromises = exigences
        .filter(exigence => !exigence.id) // Filtrer celles qui n'ont pas d'ID (nouvelles)
        .map(exigence => this.create({ ...exigence, projectId }));
      
      // Attendre la fin de toutes les opérations
      const results = await Promise.all([...updatePromises, ...createPromises]);
      
      // Invalider la liste
      this.invalidateList();
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des exigences en masse:', error);
      throw error;
    }
  }
}

export const exigencesService = new ExigencesService();
