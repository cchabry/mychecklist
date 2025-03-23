
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
      const mockAudits = await import('@/lib/mockData').then(m => m.mockAudits);
      return mockAudits.find(audit => audit.id === id) || null;
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
      const mockAudits = await import('@/lib/mockData').then(m => m.mockAudits);
      
      if (filters && filters.projectId) {
        return mockAudits.filter(audit => audit.projectId === filters.projectId);
      }
      
      return mockAudits;
    }
    
    try {
      const audits = await notionApi.getAudits(filters?.projectId);
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
        status: data.status || 'En cours'
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
      const mockAudits = await import('@/lib/mockData').then(m => m.mockAudits);
      const auditIndex = mockAudits.findIndex(audit => audit.id === id);
      
      if (auditIndex === -1) {
        throw new Error(`Audit non trouvé: ${id}`);
      }
      
      const updatedAudit: Audit = {
        ...mockAudits[auditIndex],
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
