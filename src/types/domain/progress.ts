
/**
 * Types pour le suivi des progrès des actions correctives
 */

import { ComplianceLevel, StatusType } from '../enums';

/**
 * Interface pour le suivi des progrès d'une action corrective
 * 
 * Un suivi des progrès représente une étape dans la réalisation d'une action corrective.
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
