
/**
 * Constantes spécifiques aux audits
 * 
 * Ce fichier définit les constantes utilisées dans la fonctionnalité de gestion des audits
 */

/**
 * Statuts possibles pour un audit
 */
export const AUDIT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

/**
 * Options pour le filtrage des audits
 */
export const AUDIT_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les audits' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminés' },
  { value: 'archived', label: 'Archivés' }
];
