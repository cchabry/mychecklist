
import { Audit } from '@/lib/types';
import { BaseService } from './baseService';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';

/**
 * Service pour la gestion des audits
 */
export class AuditsService extends BaseService<Audit> {
  constructor() {
    super('audits', {
      cacheTTL: 5 * 60 * 1000, // 5 minutes
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
  protected async fetchAll(filters?: QueryFilters): Promise<Audit[]> {
    try {
      const audits = await notionApi.getAudits();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(audits, filters);
      }
      
      return audits;
    } catch (error) {
      console.error('Erreur lors de la récupération des audits:', error);
      return [];
    }
  }
  
  /**
   * Crée un nouvel audit
   */
  protected async createItem(data: Partial<Audit>): Promise<Audit> {
    if (!data.projectId) {
      throw new Error('L\'ID du projet est requis');
    }
    
    return await notionApi.createAudit({
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      projectId: data.projectId,
      ...data
    });
  }
  
  /**
   * Met à jour un audit existant
   */
  protected async updateItem(id: string, data: Partial<Audit>): Promise<Audit> {
    const existingAudit = await this.fetchById(id);
    
    if (!existingAudit) {
      throw new Error(`Audit #${id} non trouvé`);
    }
    
    return await notionApi.updateAudit(id, {
      ...existingAudit,
      ...data,
      id // S'assurer que l'ID reste inchangé
    });
  }
  
  /**
   * Supprime un audit
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteAudit(id);
  }
  
  /**
   * Récupère les audits pour un projet spécifique
   */
  async getByProject(projectId: string): Promise<Audit[]> {
    return this.getAll(undefined, { projectId });
  }
  
  /**
   * Récupère le dernier audit pour un projet
   */
  async getLatestByProject(projectId: string): Promise<Audit | null> {
    const audits = await this.getByProject(projectId);
    
    if (audits.length === 0) {
      return null;
    }
    
    // Trier les audits par date (du plus récent au plus ancien)
    return audits.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })[0];
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux audits
   */
  private applyFilters(audits: Audit[], filters: QueryFilters): Audit[] {
    return audits.filter(audit => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const auditValue = audit[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(auditValue);
        }
        
        return auditValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const auditsService = new AuditsService();
