
import { Evaluation, ComplianceStatus } from '@/lib/types';
import { BaseService } from './baseService';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';

/**
 * Service pour la gestion des évaluations
 */
export class EvaluationsService extends BaseService<Evaluation> {
  constructor() {
    super('evaluations', {
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }
  
  /**
   * Récupère une évaluation par son ID
   */
  protected async fetchById(id: string): Promise<Evaluation | null> {
    try {
      return await notionApi.getEvaluation(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'évaluation #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère toutes les évaluations
   */
  protected async fetchAll(filters?: QueryFilters): Promise<Evaluation[]> {
    try {
      const evaluations = await notionApi.getEvaluations();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(evaluations, filters);
      }
      
      return evaluations;
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      return [];
    }
  }
  
  /**
   * Crée une nouvelle évaluation
   */
  protected async createItem(data: Partial<Evaluation>): Promise<Evaluation> {
    if (!data.auditId) {
      throw new Error("L'ID de l'audit est requis");
    }
    
    if (!data.pageId) {
      throw new Error("L'ID de la page est requis");
    }
    
    if (!data.exigenceId) {
      throw new Error("L'ID de l'exigence est requis");
    }
    
    return await notionApi.createEvaluation({
      auditId: data.auditId,
      pageId: data.pageId,
      exigenceId: data.exigenceId,
      score: data.score || ComplianceStatus.NotEvaluated,
      comment: data.comment || '',
      attachments: data.attachments || []
    });
  }
  
  /**
   * Met à jour une évaluation existante
   */
  protected async updateItem(id: string, data: Partial<Evaluation>): Promise<Evaluation> {
    const existingEvaluation = await this.fetchById(id);
    
    if (!existingEvaluation) {
      throw new Error(`Évaluation #${id} non trouvée`);
    }
    
    return await notionApi.updateEvaluation(id, {
      ...data
    });
  }
  
  /**
   * Supprime une évaluation
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteEvaluation(id);
  }
  
  /**
   * Récupère les évaluations pour un audit spécifique
   */
  async getByAuditId(auditId: string): Promise<Evaluation[]> {
    // Vérifier d'abord le cache
    const cacheKey = `${this.entityName}:audit:${auditId}`;
    const cached = await this.entityCache.getById(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    try {
      const evaluations = await notionApi.getEvaluationsByAuditId(auditId);
      
      // Mettre en cache pour les requêtes futures
      await this.entityCache.setById(cacheKey, evaluations, this.cacheTTL);
      
      return evaluations;
    } catch (error) {
      console.error(`Erreur lors de la récupération des évaluations pour l'audit #${auditId}:`, error);
      return [];
    }
  }
  
  /**
   * Récupère les évaluations pour une page spécifique dans un audit
   */
  async getByAuditAndPage(auditId: string, pageId: string): Promise<Evaluation[]> {
    const auditEvaluations = await this.getByAuditId(auditId);
    return auditEvaluations.filter(evaluation => evaluation.pageId === pageId);
  }
  
  /**
   * Récupère les évaluations pour une exigence spécifique dans un audit
   */
  async getByAuditAndExigence(auditId: string, exigenceId: string): Promise<Evaluation[]> {
    const auditEvaluations = await this.getByAuditId(auditId);
    return auditEvaluations.filter(evaluation => evaluation.exigenceId === exigenceId);
  }
  
  /**
   * Récupère l'évaluation spécifique pour une page et une exigence dans un audit
   */
  async getByAuditPageAndExigence(auditId: string, pageId: string, exigenceId: string): Promise<Evaluation | null> {
    const auditEvaluations = await this.getByAuditId(auditId);
    return auditEvaluations.find(
      evaluation => evaluation.pageId === pageId && evaluation.exigenceId === exigenceId
    ) || null;
  }
  
  /**
   * Définit l'évaluation pour une combinaison audit/page/exigence
   */
  async setEvaluation(
    auditId: string,
    pageId: string,
    exigenceId: string,
    score: ComplianceStatus,
    comment: string = '',
    attachments: string[] = []
  ): Promise<Evaluation> {
    const existing = await this.getByAuditPageAndExigence(auditId, pageId, exigenceId);
    
    if (existing) {
      return this.update(existing.id, { score, comment, attachments });
    } else {
      return this.create({
        auditId,
        pageId,
        exigenceId,
        score,
        comment,
        attachments
      });
    }
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux évaluations
   */
  private applyFilters(evaluations: Evaluation[], filters: QueryFilters): Evaluation[] {
    return evaluations.filter(evaluation => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const evaluationValue = evaluation[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(evaluationValue);
        }
        
        return evaluationValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const evaluationsService = new EvaluationsService();
