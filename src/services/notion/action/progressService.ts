
import { ActionProgress } from '@/types/domain/action';
import { ActionStatus } from '@/types/domain/action';

/**
 * Service pour gérer les progressions des actions correctives
 */
export const progressService = {
  /**
   * Récupère les mises à jour de progression pour une action
   */
  async getProgressUpdates(actionId: string): Promise<ActionProgress[]> {
    // En mode démo, on renvoie des données simulées
    return [
      {
        id: `progress-${actionId}-1`,
        actionId,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Début des travaux de correction",
        author: "Jean Dupont",
        responsible: "Équipe SEO"
      },
      {
        id: `progress-${actionId}-2`,
        actionId,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Mise en place des balises Alt sur 50% des images",
        author: "Marie Martin",
        responsible: "Équipe SEO",
        newStatus: ActionStatus.InProgress
      }
    ];
  },

  /**
   * Ajoute une mise à jour de progression pour une action
   */
  async addProgressUpdate(
    actionId: string,
    data: Omit<ActionProgress, 'id' | 'actionId' | 'date'>
  ): Promise<ActionProgress> {
    const newProgress: ActionProgress = {
      id: `progress-${actionId}-${Date.now()}`,
      actionId,
      date: new Date().toISOString(),
      comment: data.comment,
      responsible: data.responsible,
      author: data.author || 'Utilisateur',
      score: data.score,
      newStatus: data.newStatus,
      attachments: data.attachments
    };
    
    // En mode démo, on simule l'ajout et on retourne directement l'objet
    return newProgress;
  }
};
