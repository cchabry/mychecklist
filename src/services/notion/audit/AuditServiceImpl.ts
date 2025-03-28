
/**
 * Implémentation du service d'audit
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Audit } from '@/types/domain';
import { generateMockId } from '../base/utils';

/**
 * Type pour la création d'un audit
 */
interface CreateAuditInput {
  projectId: string;
  name: string;
  description?: string;
}

/**
 * Type pour la mise à jour d'un audit
 */
interface UpdateAuditInput {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

/**
 * Implémentation standardisée du service d'audits
 */
export class AuditServiceImpl extends BaseNotionService<Audit, CreateAuditInput, UpdateAuditInput> {
  constructor() {
    super('Audit', 'auditsDbId');
  }
  
  /**
   * Génère des audits fictifs pour le mode mock
   */
  protected async getMockEntities(): Promise<Audit[]> {
    const now = new Date().toISOString();
    return [
      {
        id: 'audit_1',
        projectId: 'project_1',
        name: 'Audit initial',
        description: 'Premier audit du projet',
        status: 'en_cours',
        createdAt: now,
        updatedAt: now,
        progress: 25
      },
      {
        id: 'audit_2',
        projectId: 'project_1',
        name: 'Audit de suivi',
        description: 'Audit de vérification des corrections',
        status: 'terminé',
        createdAt: now,
        updatedAt: now,
        progress: 100
      }
    ];
  }
  
  /**
   * Crée un audit fictif en mode mock
   */
  protected async mockCreate(data: CreateAuditInput): Promise<Audit> {
    const now = new Date().toISOString();
    return {
      id: generateMockId('audit'),
      projectId: data.projectId,
      name: data.name,
      description: data.description || '',
      status: 'en_cours',
      createdAt: now,
      updatedAt: now,
      progress: 0
    };
  }
  
  /**
   * Met à jour un audit fictif en mode mock
   */
  protected async mockUpdate(entity: UpdateAuditInput): Promise<Audit> {
    const mockAudits = await this.getMockEntities();
    const existingAudit = mockAudits.find(a => a.id === entity.id);
    
    if (!existingAudit) {
      throw new Error(`Audit #${entity.id} non trouvé`);
    }
    
    return {
      ...existingAudit,
      name: entity.name !== undefined ? entity.name : existingAudit.name,
      description: entity.description !== undefined ? entity.description : existingAudit.description,
      status: entity.status !== undefined ? entity.status : existingAudit.status,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Implémentation de la récupération des audits
   */
  protected async getAllImpl(): Promise<NotionResponse<Audit[]>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }
  
  /**
   * Implémentation de la récupération d'un audit par son ID
   */
  protected async getByIdImpl(_id: string): Promise<NotionResponse<Audit>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }
  
  /**
   * Implémentation de la création d'un audit
   */
  protected async createImpl(_data: CreateAuditInput): Promise<NotionResponse<Audit>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }
  
  /**
   * Implémentation de la mise à jour d'un audit
   */
  protected async updateImpl(_entity: UpdateAuditInput): Promise<NotionResponse<Audit>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }
  
  /**
   * Implémentation de la suppression d'un audit
   */
  protected async deleteImpl(_id: string): Promise<NotionResponse<boolean>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }
}
