
import { Audit } from '@/lib/types';
import { BaseServiceAbstract } from './BaseServiceAbstract';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

// Définir l'interface AuditAction manquante
export interface AuditAction {
  id: string;
  auditId: string;
  evaluationId: string;
  description: string;
  assignee?: string;
  status: 'pending' | 'inProgress' | 'completed';
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

/**
 * Service pour la gestion des audits
 */
class AuditsService extends BaseServiceAbstract<Audit> {
  constructor() {
    super('audits', {
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }
  
  /**
   * Récupère un audit par son ID
   */
  protected async fetchById(id: string): Promise<Audit | null> {
    try {
      return await notionApi.getAudit(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'audit #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère tous les audits
   */
  protected async fetchAll(): Promise<Audit[]> {
    try {
      // Pour l'instant, nous ne pouvons pas récupérer tous les audits
      // car ils sont liés à un projet
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des audits:', error);
      return [];
    }
  }
  
  /**
   * Implémentation requise de createItem
   */
  protected async createItem(data: Partial<Audit>): Promise<Audit> {
    if (!data.projectId) {
      throw new Error('ID de projet non spécifié');
    }
    
    try {
      const audit = await notionApi.createAudit({
        name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
        projectId: data.projectId
      });
      
      return audit;
    } catch (error) {
      console.error('Erreur lors de la création de l\'audit:', error);
      throw error;
    }
  }
  
  /**
   * Implémentation requise de updateItem
   */
  protected async updateItem(id: string, data: Partial<Audit>): Promise<Audit> {
    try {
      const updatedAudit = await notionApi.updateAudit(id, data);
      
      if (!updatedAudit) {
        throw new Error(`Impossible de mettre à jour l'audit #${id}`);
      }
      
      return updatedAudit;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'audit #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Implémentation requise de deleteItem
   */
  protected async deleteItem(id: string): Promise<boolean> {
    try {
      const success = await notionApi.deleteAudit(id);
      
      if (!success) {
        throw new Error(`Impossible de supprimer l'audit #${id}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'audit #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère les audits pour un projet spécifique
   */
  async getByProject(projectId: string): Promise<Audit[]> {
    try {
      if (!projectId) {
        throw new Error('ID de projet non spécifié');
      }
      
      // Cette fonction n'est pas encore implémentée dans l'API
      // Pour l'instant, nous retournons un tableau vide
      return [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des audits pour le projet #${projectId}:`, error);
      return [];
    }
  }
  
  /**
   * Crée un nouvel audit
   */
  async create(data: Partial<Audit>): Promise<Audit> {
    try {
      if (!data.projectId) {
        throw new Error('ID de projet non spécifié');
      }
      
      // Vérifier si la base de données des audits est configurée
      const auditsDbId = localStorage.getItem('notion_audits_database_id');
      
      if (!auditsDbId && !operationMode.isDemoMode) {
        console.warn("Base de données des audits non configurée, activation du mode démo");
        toast.warning("Base de données des audits non configurée", {
          description: "Le mode démo sera utilisé pour cette opération."
        });
        operationMode.enableDemoMode("Base de données des audits non configurée");
      }
      
      // Appeler l'API pour créer l'audit
      const audit = await notionApi.createAudit({
        name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
        projectId: data.projectId
      });
      
      console.log("Audit créé:", audit);
      
      // Invalider le cache en utilisant la méthode du parent
      this.clearCache();
      
      return audit;
    } catch (error) {
      console.error('Erreur lors de la création de l\'audit:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour un audit existant
   */
  async update(id: string, data: Partial<Audit>): Promise<Audit> {
    try {
      if (!id) {
        throw new Error('ID d\'audit non spécifié');
      }
      
      // Appeler l'API pour mettre à jour l'audit
      const updatedAudit = await notionApi.updateAudit(id, data);
      
      if (!updatedAudit) {
        throw new Error(`Impossible de mettre à jour l'audit #${id}`);
      }
      
      // Invalider le cache en utilisant la méthode du parent
      this.clearCache();
      
      return updatedAudit;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'audit #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Supprime un audit
   */
  async delete(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('ID d\'audit non spécifié');
      }
      
      // Récupérer l'audit pour avoir son projectId
      const audit = await this.getById(id);
      const projectId = audit?.projectId;
      
      // Appeler l'API pour supprimer l'audit
      const success = await notionApi.deleteAudit(id);
      
      if (!success) {
        throw new Error(`Impossible de supprimer l'audit #${id}`);
      }
      
      // Invalider le cache en utilisant la méthode du parent
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'audit #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Ajoute une action à un audit
   */
  async addAction(auditId: string, action: AuditAction): Promise<boolean> {
    // Cette fonction n'est pas encore implémentée
    // Pour l'instant, nous retournons true
    return true;
  }
  
  /**
   * Met à jour une action d'un audit
   */
  async updateAction(auditId: string, actionId: string, action: Partial<AuditAction>): Promise<boolean> {
    // Cette fonction n'est pas encore implémentée
    // Pour l'instant, nous retournons true
    return true;
  }
}

export const auditsService = new AuditsService();
