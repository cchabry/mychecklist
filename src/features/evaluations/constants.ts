
/**
 * Constantes pour la feature Evaluations
 */

import { ComplianceLevel } from '@/types/enums';

/**
 * Options de filtre pour les scores
 */
export const SCORE_OPTIONS = [
  { value: ComplianceLevel.Compliant, label: 'Conforme' },
  { value: ComplianceLevel.PartiallyCompliant, label: 'Partiellement conforme' },
  { value: ComplianceLevel.NonCompliant, label: 'Non conforme' },
  { value: ComplianceLevel.NotApplicable, label: 'Non applicable' }
];

/**
 * Textes descriptifs pour les scores
 */
export const SCORE_DESCRIPTIONS = {
  [ComplianceLevel.Compliant]: 'La page respecte totalement cette exigence',
  [ComplianceLevel.PartiallyCompliant]: 'La page respecte partiellement cette exigence',
  [ComplianceLevel.NonCompliant]: 'La page ne respecte pas cette exigence',
  [ComplianceLevel.NotApplicable]: 'Cette exigence ne s\'applique pas à cette page'
};
