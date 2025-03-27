
/**
 * Constantes pour la feature Exigences
 */

import { ImportanceLevel } from '@/types/enums';

/**
 * Options de tri disponibles pour les exigences
 */
export const EXIGENCE_SORT_OPTIONS = {
  IMPORTANCE_DESC: 'importance_desc',
  IMPORTANCE_ASC: 'importance_asc',
  CATEGORY_ASC: 'category_asc',
  CATEGORY_DESC: 'category_desc'
} as const;

/**
 * Valeurs numériques pour l'ordre d'importance
 */
export const IMPORTANCE_ORDER = {
  [ImportanceLevel.Major]: 5,
  [ImportanceLevel.Important]: 4, 
  [ImportanceLevel.Medium]: 3,
  [ImportanceLevel.Minor]: 2,
  [ImportanceLevel.NotApplicable]: 1
};
