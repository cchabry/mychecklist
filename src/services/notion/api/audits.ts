
/**
 * API Notion pour les audits
 */

import { AuditApi } from '@/types/api/domain/auditApi';
import { auditService } from '../audit';
import { Audit } from '@/types/domain';
import { 
  CreateAuditData, 
  UpdateAuditData 
} from '@/types/api/domain/auditApi';
import { 
  DELETE_ERROR, 
  FETCH_ERROR, 
  CREATE_ERROR, 
  UPDATE_ERROR 
} from '@/constants/errorMessages';

/**
 * Implémentation de l'API des audits utilisant le service Notion
 */
class NotionAuditApi implements AuditApi {
  /**
   * Récupère tous les audits pour un projet
   */
  async getAudits(projectId: string): Promise<Audit[]> {
    const response = await auditService.getAudits(projectId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Récupère un audit par son ID
   */
  async getAuditById(id: string): Promise<Audit | null> {
    const response = await auditService.getAuditById(id);
    
    if (!response.success) {
      return null;
    }
    
    return response.data || null;
  }
  
  /**
   * Crée un nouvel audit
   */
  async createAudit(data: CreateAuditData): Promise<Audit> {
    const response = await auditService.createAudit(data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Met à jour un audit existant
   */
  async updateAudit(id: string, data: UpdateAuditData): Promise<Audit> {
    const response = await auditService.updateAudit(id, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Supprime un audit
   */
  async deleteAudit(id: string): Promise<boolean> {
    const response = await auditService.deleteAudit(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    
    return response.data ?? false;
  }
}

// Exporter une instance singleton
export const auditsApi = new NotionAuditApi();

// Export par défaut
export default auditsApi;
