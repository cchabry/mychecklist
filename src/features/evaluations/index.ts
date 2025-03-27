
/**
 * Fonctionnalité Evaluations
 * 
 * Ce module expose les fonctionnalités liées aux évaluations,
 * qui représentent les résultats d'audit pour chaque exigence et page.
 */

// Réexporter les composants, hooks, types et utilitaires
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { evaluationsApi } from '@/services/notion/api/evaluations';
import { Evaluation } from '@/types/domain';

/**
 * Récupère toutes les évaluations pour un audit
 * 
 * @param auditId - Identifiant de l'audit
 * @param pageId - Optionnel: Filtrer par page spécifique
 * @param exigenceId - Optionnel: Filtrer par exigence spécifique
 * @returns Promise résolvant vers un tableau d'évaluations
 * @throws Error si la récupération échoue
 */
export async function getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> {
  try {
    return await evaluationsApi.getEvaluations(auditId, pageId, exigenceId);
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
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
 * @param evaluation - Données de l'évaluation à créer (sans l'id, createdAt, updatedAt)
 * @returns Promise résolvant vers l'évaluation créée
 * @throws Error si la création échoue
 */
export async function createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation> {
  try {
    return await evaluationsApi.createEvaluation(evaluation);
  } catch (error) {
    console.error(`Erreur lors de la création de l'évaluation:`, error);
    throw new Error(`Impossible de créer l'évaluation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une évaluation existante
 * 
 * @param evaluation - Évaluation à mettre à jour
 * @returns Promise résolvant vers l'évaluation mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateEvaluation(evaluation: Evaluation): Promise<Evaluation> {
  try {
    return await evaluationsApi.updateEvaluation(evaluation);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'évaluation ${evaluation.id}:`, error);
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
