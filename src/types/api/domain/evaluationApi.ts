
/**
 * Interface pour l'API des évaluations
 * 
 * Cette interface définit les opérations disponibles pour accéder
 * et manipuler les données d'évaluation, indépendamment de l'implémentation.
 */

import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput } from '@/services/notion/evaluation/types';

/**
 * Interface définissant les opérations de l'API d'évaluations
 */
export interface EvaluationApi {
  /**
   * Récupère les évaluations correspondant aux critères fournis
   * 
   * @param auditId - Identifiant de l'audit
   * @param pageId - Identifiant de la page (optionnel)
   * @param exigenceId - Identifiant de l'exigence (optionnel)
   * @returns Promise résolvant vers un tableau d'évaluations
   * @throws Error si la récupération échoue
   */
  getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]>;
  
  /**
   * Récupère une évaluation par son ID
   * 
   * @param id - Identifiant unique de l'évaluation
   * @returns Promise résolvant vers l'évaluation ou null si non trouvée
   * @throws Error si la récupération échoue de manière inattendue
   */
  getEvaluationById(id: string): Promise<Evaluation | null>;
  
  /**
   * Crée une nouvelle évaluation
   * 
   * @param evaluation - Données de l'évaluation à créer
   * @returns Promise résolvant vers l'évaluation créée
   * @throws Error si la création échoue
   */
  createEvaluation(evaluation: CreateEvaluationInput): Promise<Evaluation>;
  
  /**
   * Met à jour une évaluation existante
   * 
   * @param evaluation - Données complètes de l'évaluation avec les modifications
   * @returns Promise résolvant vers l'évaluation mise à jour
   * @throws Error si la mise à jour échoue
   */
  updateEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  
  /**
   * Supprime une évaluation
   * 
   * @param id - Identifiant unique de l'évaluation à supprimer
   * @returns Promise résolvant vers true si la suppression a réussi
   * @throws Error si la suppression échoue
   */
  deleteEvaluation(id: string): Promise<boolean>;
}
