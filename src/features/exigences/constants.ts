
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

/**
 * Mapping des niveaux d'importance avec leurs labels et couleurs
 */
export const IMPORTANCE_LEVEL_MAPPING = {
  [ImportanceLevel.Major]: { label: 'Majeur', colorClass: 'bg-red-500' },
  [ImportanceLevel.Important]: { label: 'Important', colorClass: 'bg-orange-500' },
  [ImportanceLevel.Medium]: { label: 'Moyen', colorClass: 'bg-yellow-500' },
  [ImportanceLevel.Minor]: { label: 'Mineur', colorClass: 'bg-blue-500' },
  [ImportanceLevel.NotApplicable]: { label: 'Non applicable', colorClass: 'bg-gray-500' }
};
