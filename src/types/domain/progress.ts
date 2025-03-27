
/**
 * Types pour le suivi des actions correctives
 */

import { ComplianceLevel, StatusType } from '../enums';

/**
 * Interface pour un suivi de progrès d'action corrective
 * 
 * Un suivi de progrès représente une mise à jour de l'état d'avancement
 * d'une action corrective en cours.
 */
export interface ActionProgress {
  /**
   * Identifiant unique du progrès
   */
  id: string;
  
  /**
   * Identifiant de l'action corrective concernée
   */
  actionId: string;
  
  /**
   * Date de l'intervention (au format ISO)
   */
  date: string;
  
  /**
   * Personne responsable de l'intervention
   */
  responsible: string;
  
  /**
   * Commentaire ou description de l'intervention
   */
  comment?: string;
  
  /**
   * Niveau de conformité atteint après l'intervention
   */
  score: ComplianceLevel;
  
  /**
   * Statut de l'action après l'intervention
   */
  status: StatusType;
}
