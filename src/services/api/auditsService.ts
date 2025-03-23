
import { Audit } from '@/lib/types';
import { QueryFilters } from './types';
import { BaseServiceAbstract } from './BaseServiceAbstract';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

class AuditsService extends BaseServiceAbstract<Audit> {
  constructor() {
    super('audits', {
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    });
  }
  
  protected async fetchById(id: string): Promise<Audit | null> {
    if (operationMode.isDemoMode) {
      const mockData = await import('@/lib/mockData/index').then(m => m.mockData);
      return mockData.getAudit(id) || null;
    }
    
    try {
      const audit = await notionApi.getAudit(id);
      return audit;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'audit ${id}:`, error);
      throw error;
    }
  }
  
  protected async fetchAll(filters?: QueryFilters): Promise<Audit[]> {
    if (operationMode.isDemoMode) {
      const mockData = await import('@/lib/mockData/index').then(m => m.mockData);
      
      const allAudits = mockData.getAudits();
      
      if (filters && filters.projectId) {
        return allAudits.filter(audit => audit.projectId === filters.projectId);
      }
      
      return allAudits;
    }
    
    try {
      const audits = await notionApi.getAudits();
      return audits;
    } catch (error) {
      console.error('Erreur lors de la récupération des audits:', error);
      throw error;
    }
  }
  
  protected async createItem(data: Partial<Audit>): Promise<Audit> {
    if (operationMode.isDemoMode) {
      const newAudit: Audit = {
        id: `audit_${Date.now()}`,
        name: data.name || 'Nouvel audit',
        projectId: data.projectId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: data.items || [],
        score: data.score || 0,
        version: data.version || '1.0'
      };
      
      return newAudit;
    }
    
    try {
      const audit = await notionApi.createAudit(data);
      return audit;
    } catch (error) {
      console.error('Erreur lors de la création de l\'audit:', error);
      throw error;
    }
  }
  
  protected async updateItem(id: string, data: Partial<Audit>): Promise<Audit> {
    if (operationMode.isDemoMode) {
      const mockData = await import('@/lib/mockData/index').then(m => m.mockData);
      const existingAudit = mockData.getAudit(id);
      
      if (!existingAudit) {
        throw new Error(`Audit non trouvé: ${id}`);
      }
      
      const updatedAudit: Audit = {
        ...existingAudit,
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      return updatedAudit;
    }
    
    try {
      const audit = await notionApi.updateAudit(id, data);
      return audit;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'audit ${id}:`, error);
      throw error;
    }
  }
  
  protected async deleteItem(id: string): Promise<boolean> {
    if (operationMode.isDemoMode) {
      return true;
    }
    
    try {
      await notionApi.deleteAudit(id);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'audit ${id}:`, error);
      throw error;
    }
  }
}

export const auditsService = new AuditsService();
