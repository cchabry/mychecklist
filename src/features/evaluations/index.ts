
/**
 * Point d'entrée pour la feature Evaluations
 */

// Réexporter depuis les sous-modules
export * from './types';
export * from './utils';
export * from './constants';
export * from './hooks';
export * from './components';

// Services et API
import { evaluationsApi } from '@/services/notion/api/evaluations';
import { Evaluation, CreateEvaluationData, UpdateEvaluationData } from './types';
import { Attachment } from '@/types/domain';

/**
 * Récupère toutes les évaluations d'un audit
 * 
 * @param auditId - Identifiant de l'audit
 * @param pageId - Identifiant de la page (optionnel)
 * @param exigenceId - Identifiant de l'exigence (optionnel)
 * @returns Promise résolvant vers un tableau d'évaluations
 * @throws Error si la récupération échoue
 */
export async function getEvaluations(
  auditId: string, 
  pageId?: string, 
  exigenceId?: string
): Promise<Evaluation[]> {
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
    return await evaluationsApi.createEvaluation(data);
  } catch (error) {
    console.error(`Erreur lors de la création de l'évaluation:`, error);
    throw new Error(`Impossible de créer l'évaluation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une évaluation existante
 * 
 * @param id - Identifiant de l'évaluation à mettre à jour
 * @param data - Données de mise à jour partielles
 * @returns Promise résolvant vers l'évaluation mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateEvaluation(id: string, data: UpdateEvaluationData): Promise<Evaluation> {
  try {
    // Récupérer l'évaluation existante
    const existingEvaluation = await getEvaluationById(id);
    
    if (!existingEvaluation) {
      throw new Error(`Évaluation avec l'ID ${id} non trouvée`);
    }
    
    // Fusionner les données existantes avec les mises à jour
    const updatedEvaluation: Evaluation = {
      ...existingEvaluation,
      ...data,
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
