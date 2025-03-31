
// Importation fictive pour démonstration
import { ActionProgress, ActionStatus } from '@/types/domain/action';
import { ComplianceStatus } from '@/types/domain/evaluation';

/**
 * Service de gestion des progrès d'actions correctives (mode démo)
 */
export class ActionProgressService {
  private progressItems: ActionProgress[] = [];
  
  /**
   * Obtenir tous les progrès pour une action
   */
  public async getProgressForAction(actionId: string): Promise<ActionProgress[]> {
    return this.progressItems.filter(item => item.actionId === actionId);
  }
  
  /**
   * Créer un nouvel enregistrement de progrès
   */
  public async createProgress(data: Partial<ActionProgress>): Promise<ActionProgress> {
    if (!data.actionId) {
      throw new Error('L\'identifiant de l\'action est requis');
    }
    
    const now = new Date();
    const newProgress: ActionProgress = {
      id: `progress_${Date.now()}`,
      actionId: data.actionId,
      date: data.date || now.toISOString(),
      comment: data.comment || '',
      responsible: data.responsible,
      score: data.score,
      newStatus: data.newStatus,
      attachments: data.attachments || [],
      author: data.author || 'Utilisateur démo'
    };
    
    this.progressItems.push(newProgress);
    return newProgress;
  }
  
  /**
   * Mettre à jour un enregistrement de progrès
   */
  public async updateProgress(id: string, data: Partial<ActionProgress>): Promise<ActionProgress> {
    const index = this.progressItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Enregistrement de progrès non trouvé');
    }
    
    const updatedProgress = {
      ...this.progressItems[index],
      ...data,
      comment: data.comment || this.progressItems[index].comment,
      responsible: data.responsible || this.progressItems[index].responsible,
      score: data.score || this.progressItems[index].score,
      newStatus: data.newStatus || this.progressItems[index].newStatus
    };
    
    this.progressItems[index] = updatedProgress;
    return updatedProgress;
  }
  
  /**
   * Supprimer un enregistrement de progrès
   */
  public async deleteProgress(id: string): Promise<boolean> {
    const initialLength = this.progressItems.length;
    this.progressItems = this.progressItems.filter(item => item.id !== id);
    return this.progressItems.length < initialLength;
  }
  
  /**
   * Réinitialiser les données (pour les tests)
   */
  public reset(): void {
    this.progressItems = [];
  }
}

// Instance singleton
export const actionProgressService = new ActionProgressService();
