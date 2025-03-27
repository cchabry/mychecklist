
/**
 * Implémentation de l'API des audits
 */

import { AuditApi } from '@/types/api/domain';
import { Audit } from '@/types/domain';
import { auditService } from '../audit';
import { FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR, NOT_FOUND_ERROR } from '@/constants/errorMessages';

export class NotionAuditApi implements AuditApi {
  async getAudits(projectId: string): Promise<Audit[]> {
    const response = await auditService.getAudits(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    return response.data || [];
  }
  
  async getAuditById(id: string): Promise<Audit> {
    const response = await auditService.getAuditById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `${NOT_FOUND_ERROR}: Audit #${id}`);
    }
    return response.data as Audit;
  }
  
  async createAudit(audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audit> {
    const response = await auditService.createAudit(audit);
    if (!response.success) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    return response.data as Audit;
  }
  
  async updateAudit(audit: Audit): Promise<Audit> {
    const response = await auditService.updateAudit(audit);
    if (!response.success) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    return response.data as Audit;
  }
  
  async deleteAudit(id: string): Promise<boolean> {
    const response = await auditService.deleteAudit(id);
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    return true;
  }
}

export const auditsApi = new NotionAuditApi();
