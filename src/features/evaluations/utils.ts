
/**
 * Utilitaires pour la feature Evaluations
 */

import { Evaluation, EvaluationFilters } from './types';
import { ComplianceLevel } from '@/types/enums';

/**
 * Filtre les évaluations selon les critères spécifiés
 */
export function filterEvaluations(evaluations: Evaluation[], filters: EvaluationFilters): Evaluation[] {
  return evaluations.filter(evaluation => {
    // Filtre par score
    if (filters.score !== undefined && evaluation.score !== filters.score) {
      return false;
    }
    
    // Filtre par exigence
    if (filters.exigenceId && evaluation.exigenceId !== filters.exigenceId) {
      return false;
    }
    
    // Filtre par page
    if (filters.pageId && evaluation.pageId !== filters.pageId) {
      return false;
    }
    
    // Filtre par recherche (texte libre)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const commentMatch = evaluation.comment ? evaluation.comment.toLowerCase().includes(searchLower) : false;
      
      if (!commentMatch) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Calcule les statistiques d'évaluation pour un audit
 */
export function calculateEvaluationStats(evaluations: Evaluation[]) {
  const total = evaluations.length;
  const compliant = evaluations.filter(e => e.score === ComplianceLevel.Compliant).length;
  const partiallyCompliant = evaluations.filter(e => e.score === ComplianceLevel.PartiallyCompliant).length;
  const nonCompliant = evaluations.filter(e => e.score === ComplianceLevel.NonCompliant).length;
  const notApplicable = evaluations.filter(e => e.score === ComplianceLevel.NotApplicable).length;
  
  // Exclure les NA du calcul du score global
  const evaluated = total - notApplicable;
  const complianceScore = evaluated > 0 
    ? Math.round(((compliant + (partiallyCompliant * 0.5)) / evaluated) * 100) 
    : 0;
  
  return {
    total,
    compliant,
    partiallyCompliant,
    nonCompliant,
    notApplicable,
    complianceScore
  };
}
