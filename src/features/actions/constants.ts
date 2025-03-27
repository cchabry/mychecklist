
/**
 * Constantes pour la feature Actions
 */

import { PriorityLevel, StatusType } from '@/types/enums';

/**
 * Options de filtre pour les priorités
 */
export const PRIORITY_OPTIONS = [
  { value: PriorityLevel.Critical, label: 'Critique' },
  { value: PriorityLevel.High, label: 'Haute' },
  { value: PriorityLevel.Medium, label: 'Moyenne' },
  { value: PriorityLevel.Low, label: 'Basse' }
];

/**
 * Options de filtre pour les statuts
 */
export const STATUS_OPTIONS = [
  { value: StatusType.Todo, label: 'À faire' },
  { value: StatusType.InProgress, label: 'En cours' },
  { value: StatusType.Done, label: 'Terminé' }
];

/**
 * Options de tri pour les actions
 */
export const SORT_OPTIONS = [
  { value: 'priority_desc', label: 'Priorité (haute → basse)' },
  { value: 'priority_asc', label: 'Priorité (basse → haute)' },
  { value: 'dueDate_asc', label: 'Échéance (proche → lointaine)' },
  { value: 'dueDate_desc', label: 'Échéance (lointaine → proche)' },
  { value: 'status_asc', label: 'Statut (à faire → terminé)' },
  { value: 'status_desc', label: 'Statut (terminé → à faire)' }
];
