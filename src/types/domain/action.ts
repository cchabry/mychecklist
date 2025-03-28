
/**
 * Types pour les actions correctives
 */

import { ComplianceLevel, PriorityLevel, StatusType } from '../enums';

/**
 * Interface pour une action corrective
 * 
 * Une action corrective représente une tâche à effectuer pour corriger un problème
 * identifié lors de l'audit.
 */
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceLevel;
  priority: PriorityLevel;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: StatusType;
  description?: string; // Pour la rétrocompatibilité
}
