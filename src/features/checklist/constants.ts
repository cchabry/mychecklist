
/**
 * Constantes pour les items de checklist
 */

/**
 * Niveaux d'effort pour les items de checklist
 */
export enum EffortLevel {
  FAIBLE = 'FAIBLE',
  MOYEN = 'MOYEN',
  ÉLEVÉ = 'ÉLEVÉ'
}

/**
 * Niveaux de priorité pour les items de checklist
 */
export enum PriorityLevel {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE'
}

/**
 * Options de filtrage pour les items de checklist
 */
export const CHECKLIST_FILTER_OPTIONS = {
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
  PROFILE: 'profile',
  PHASE: 'phase',
  PRIORITY: 'priority',
  EFFORT: 'effort'
};

/**
 * Options de tri pour les items de checklist
 */
export const CHECKLIST_SORT_OPTIONS = [
  { label: 'Priorité (haute → basse)', value: 'priority_desc' },
  { label: 'Priorité (basse → haute)', value: 'priority_asc' },
  { label: 'Effort (haut → bas)', value: 'effort_desc' },
  { label: 'Effort (bas → haut)', value: 'effort_asc' },
  { label: 'Catégorie (A-Z)', value: 'category_asc' },
  { label: 'Catégorie (Z-A)', value: 'category_desc' }
];
