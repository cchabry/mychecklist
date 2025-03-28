
/**
 * Service pour la gestion des audits via Notion
 */

import { notionClient } from '../notionClient';
import { generateMockAudits } from './utils';
import { 
  AuditResponse,
  AuditsResponse,
  AuditDeleteResponse,
  CreateAuditInput
} from './types';
import { Audit } from '@/types/domain';

/**
 * Service de gestion des audits
 */
class AuditService {
  /**
   * Récupère tous les audits d'un projet
   */
  async getAudits(projectId: string): Promise<AuditsResponse> {
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
        data: generateMockAudits(projectId)
      };
    }
    
    // TODO: Implémenter la récupération des audits depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: generateMockAudits(projectId)
    };
  }
  
  /**
   * Récupère un audit par son ID
   */
  async getAuditById(id: string): Promise<AuditResponse> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockAudits = generateMockAudits('mock-project');
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
  async createAudit(audit: CreateAuditInput): Promise<AuditResponse> {
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
  async updateAudit(audit: Audit): Promise<AuditResponse> {
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
  async deleteAudit(_id: string): Promise<AuditDeleteResponse> {
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
}

// Créer et exporter une instance singleton
export const auditService = new AuditService();

// Export par défaut
export default auditService;

