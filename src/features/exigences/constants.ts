
/**
 * Constantes pour les exigences
 */

import { ImportanceLevel } from '@/types/enums';

/**
 * Options de filtrage pour les exigences
 */
export const EXIGENCE_FILTER_OPTIONS = {
  IMPORTANCE: 'importance',
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory'
};

/**
 * Options de tri pour les exigences
 */
export const EXIGENCE_SORT_OPTIONS = [
  { label: 'Importance (haute → basse)', value: 'importance_desc' },
  { label: 'Importance (basse → haute)', value: 'importance_asc' },
  { label: 'Catégorie (A-Z)', value: 'category_asc' },
  { label: 'Catégorie (Z-A)', value: 'category_desc' }
];

/**
 * Mappings des niveaux d'importance
 */
export const IMPORTANCE_LEVEL_MAPPING = {
  [ImportanceLevel.NotApplicable]: { 
    label: 'Non applicable', 
    color: 'bg-gray-100 text-gray-800',
    description: 'Cette exigence ne s\'applique pas à ce projet'
  },
  [ImportanceLevel.Minor]: { 
    label: 'Mineur', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Peu d\'impact sur la qualité globale du projet'
  },
  [ImportanceLevel.Medium]: { 
    label: 'Moyen', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Impact modéré sur la qualité du projet'
  },
  [ImportanceLevel.Important]: { 
    label: 'Important', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Impact significatif sur la qualité du projet'
  },
  [ImportanceLevel.Major]: { 
    label: 'Majeur', 
    color: 'bg-red-100 text-red-800',
    description: 'Impact critique sur la qualité et la réussite du projet'
  }
};
