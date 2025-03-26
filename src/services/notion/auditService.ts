
/**
 * Service pour la gestion des audits via Notion
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { Audit } from '@/types/domain';

/**
 * Service de gestion des audits
 */
class AuditService {
  /**
   * Récupère tous les audits d'un projet
   */
  async getAudits(projectId: string): Promise<NotionResponse<Audit[]>> {
    const config = notionClient.getConfig();
    
    if (!config.projectsDbId) {
      return { 
        success: false, 
        error: { message: "Base de données des projets non configurée" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: this.getMockAudits(projectId)
      };
    }
    
    // TODO: Implémenter la récupération des audits depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: this.getMockAudits(projectId)
    };
  }
  
  /**
   * Récupère un audit par son ID
   */
  async getAuditById(id: string): Promise<NotionResponse<Audit>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockAudits = this.getMockAudits('mock-project');
      const audit = mockAudits.find(a => a.id === id);
      
      if (!audit) {
        return { 
          success: false, 
          error: { message: `Audit #${id} non trouvé` } 
        };
      }
      
      return {
        success: true,
        data: audit
      };
    }
    
    // TODO: Implémenter la récupération d'un audit depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        id,
        projectId: 'mock-project',
        name: 'Audit exemple',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 50
      }
    };
  }
  
  /**
   * Crée un nouvel audit
   */
  async createAudit(audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotionResponse<Audit>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const now = new Date().toISOString();
      const newAudit: Audit = {
        ...audit,
        id: `audit-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      
      return {
        success: true,
        data: newAudit
      };
    }
    
    // TODO: Implémenter la création d'un audit dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    const now = new Date().toISOString();
    return {
      success: true,
      data: {
        ...audit,
        id: `audit-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      }
    };
  }
  
  /**
   * Met à jour un audit existant
   */
  async updateAudit(audit: Audit): Promise<NotionResponse<Audit>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      const updatedAudit: Audit = {
        ...audit,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: updatedAudit
      };
    }
    
    // TODO: Implémenter la mise à jour d'un audit dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...audit,
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Supprime un audit
   */
  async deleteAudit(id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'un audit dans Notion
    // Pour l'instant, simuler le succès même en mode réel
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Génère des audits fictifs pour le mode démo
   */
  private getMockAudits(projectId: string): Audit[] {
    const now = new Date().toISOString();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      {
        id: 'audit-1',
        projectId,
        name: "Audit initial",
        description: "Premier audit du projet",
        createdAt: lastMonth.toISOString(),
        updatedAt: lastMonth.toISOString(),
        progress: 100,
        version: "1.0",
        itemsCount: 10
      },
      {
        id: 'audit-2',
        projectId,
        name: "Audit de suivi",
        description: "Vérification des corrections apportées",
        createdAt: now,
        updatedAt: now,
        progress: 50,
        version: "1.1",
        itemsCount: 15
      }
    ];
  }
}

// Créer et exporter une instance singleton
export const auditService = new AuditService();

// Export par défaut
export default auditService;
