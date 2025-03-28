
/**
 * API Notion pour les audits
 * 
 * Ce module fournit l'implémentation de l'interface AuditApi
 * pour accéder aux données d'audits via l'API Notion ou en mode mock.
 */

import { AuditApi } from '@/types/api/domain/auditApi';
import { auditService } from '../audit/auditService';
import { Audit } from '@/types/domain';
import { CreateAuditData, UpdateAuditData } from '@/types/api/domain/auditApi';
import { FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR } from '@/constants/errorMessages';

/**
 * Implémentation de l'API d'audits utilisant le service Notion
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
    const now = new Date().toISOString();
    
    const auditData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      status: data.status || 'Planifié',
      progress: data.progress || 0
    };
    
    const response = await auditService.createAudit(auditData);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Met à jour un audit existant
   */
  async updateAudit(id: string, data: UpdateAuditData): Promise<Audit> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    const response = await auditService.updateAudit(id, updateData);
    
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
