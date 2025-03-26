
/**
 * Constantes spécifiques aux projets
 * 
 * Ce fichier définit les constantes utilisées dans la fonctionnalité de gestion des projets
 */

/**
 * Statuts possibles pour un projet
 */
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PENDING: 'pending',
  ARCHIVED: 'archived'
} as const;

/**
 * Options pour le filtrage des projets
 */
export const PROJECT_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les projets' },
  { value: 'active', label: 'Projets actifs' },
  { value: 'completed', label: 'Projets terminés' },
  { value: 'pending', label: 'Projets en attente' },
  { value: 'archived', label: 'Projets archivés' }
];
