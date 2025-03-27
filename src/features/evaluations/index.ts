
/**
 * Feature Evaluations
 * 
 * Ce module expose les fonctionnalités liées à la gestion des évaluations
 * d'audit pour les pages échantillons selon les exigences définies.
 * Il fournit une interface simplifiée pour interagir avec les données d'évaluation.
 */

// Réexporter les composants, hooks et utilitaires pour faciliter l'accès
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { evaluationsApi } from '@/services/notion/api/evaluations';
import { 
  Evaluation, 
  CreateEvaluationData, 
  UpdateEvaluationData 
} from './types';

/**
 * Récupère toutes les évaluations d'un audit
 * 
 * Cette fonction permet de filtrer optionnellement par page et/ou exigence.
 * 
 * @param auditId - Identifiant de l'audit
 * @param pageId - Identifiant de la page (optionnel)
 * @param exigenceId - Identifiant de l'exigence (optionnel)
 * @returns Promise résolvant vers un tableau d'évaluations
 * @throws Error si la récupération échoue
 */
export async function getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> {
  try {
    return await evaluationsApi.getEvaluations(auditId, pageId, exigenceId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des évaluations:`, error);
    throw new Error(`Impossible de récupérer les évaluations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère une évaluation par son identifiant
 * 
 * @param id - Identifiant unique de l'évaluation
 * @returns Promise résolvant vers l'évaluation ou null si non trouvée
 * @throws Error si la récupération échoue
 */
export async function getEvaluationById(id: string): Promise<Evaluation | null> {
  try {
    return await evaluationsApi.getEvaluationById(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'évaluation ${id}:`, error);
    return null;
  }
}

/**
 * Crée une nouvelle évaluation
 * 
 * @param data - Données de l'évaluation à créer
 * @returns Promise résolvant vers l'évaluation créée
 * @throws Error si la création échoue
 */
export async function createEvaluation(data: CreateEvaluationData): Promise<Evaluation> {
  try {
    return await evaluationsApi.createEvaluation({
      auditId: data.auditId,
      pageId: data.pageId,
      exigenceId: data.exigenceId,
      score: data.score,
      comment: data.comment,
      attachments: data.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de la création de l'évaluation:`, error);
    throw new Error(`Impossible de créer l'évaluation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une évaluation existante
 * 
 * Seules les propriétés spécifiées dans `data` seront mises à jour.
 * Les autres propriétés resteront inchangées.
 * 
 * @param id - Identifiant unique de l'évaluation
 * @param data - Données à mettre à jour
 * @returns Promise résolvant vers l'évaluation mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateEvaluation(id: string, data: UpdateEvaluationData): Promise<Evaluation> {
  try {
    const existingEvaluation = await evaluationsApi.getEvaluationById(id);
    if (!existingEvaluation) {
      throw new Error(`Évaluation non trouvée`);
    }
    
    const updatedEvaluation: Evaluation = {
      ...existingEvaluation,
      ...(data.score !== undefined && { score: data.score }),
      ...(data.comment !== undefined && { comment: data.comment }),
      ...(data.attachments !== undefined && { attachments: data.attachments }),
      updatedAt: new Date().toISOString()
    };
    
    return await evaluationsApi.updateEvaluation(updatedEvaluation);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'évaluation ${id}:`, error);
    throw new Error(`Impossible de mettre à jour l'évaluation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime une évaluation
 * 
 * @param id - Identifiant unique de l'évaluation à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteEvaluation(id: string): Promise<boolean> {
  try {
    return await evaluationsApi.deleteEvaluation(id);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'évaluation ${id}:`, error);
    throw new Error(`Impossible de supprimer l'évaluation: ${error instanceof Error ? error.message : String(error)}`);
  }
}
