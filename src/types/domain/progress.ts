
/**
 * Types pour les progrès d'actions correctives
 */

import { ComplianceLevel, StatusType } from '../enums';

/**
 * Interface pour un progrès d'action corrective
 * 
 * Un progrès représente une mise à jour de l'état d'avancement d'une action corrective.
 */
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceLevel;
  status: StatusType;
}
