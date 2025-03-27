
/**
 * Types pour les évaluations
 */

import { ComplianceLevel } from '../enums';

/**
 * Interface pour une évaluation
 * 
 * Une évaluation représente le résultat de l'audit d'une exigence pour une page spécifique.
 */
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceLevel;
  comment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}
