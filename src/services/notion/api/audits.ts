
/**
 * Implémentation de l'API des audits
 */

import { AuditApi } from '@/types/api/domain';
import { Audit } from '@/types/domain';
import { auditService } from '../audit';

export class NotionAuditApi implements AuditApi {
  async getAudits(projectId: string): Promise<Audit[]> {
    const response = await auditService.getAudits(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des audits");
    }
    return response.data || [];
  }
  
  async getAuditById(id: string): Promise<Audit> {
    const response = await auditService.getAuditById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Audit #${id} non trouvé`);
    }
    return response.data as Audit;
  }
  
  async createAudit(audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audit> {
    const response = await auditService.createAudit(audit);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'audit");
    }
    return response.data as Audit;
  }
  
  async updateAudit(audit: Audit): Promise<Audit> {
    const response = await auditService.updateAudit(audit);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'audit");
    }
    return response.data as Audit;
  }
  
  async deleteAudit(id: string): Promise<boolean> {
    const response = await auditService.deleteAudit(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'audit");
    }
    return true;
  }
}

export const auditsApi = new NotionAuditApi();
