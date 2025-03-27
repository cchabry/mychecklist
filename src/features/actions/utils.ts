
/**
 * Utilitaires pour la feature Actions
 */

import { CorrectiveAction, ActionFilters, ActionSortOption } from './types';
import { StatusType, PriorityLevel } from '@/types/enums';

/**
 * Filtre les actions selon les critères spécifiés
 */
export function filterActions(actions: CorrectiveAction[], filters: ActionFilters): CorrectiveAction[] {
  return actions.filter(action => {
    // Filtre par priorité
    if (filters.priority && action.priority !== filters.priority) {
      return false;
    }
    
    // Filtre par statut
    if (filters.status && action.status !== filters.status) {
      return false;
    }
    
    // Filtre par responsable
    if (filters.responsible && !action.responsible.toLowerCase().includes(filters.responsible.toLowerCase())) {
      return false;
    }
    
    // Filtre par recherche (texte libre)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const commentMatch = action.comment ? action.comment.toLowerCase().includes(searchLower) : false;
      const responsibleMatch = action.responsible.toLowerCase().includes(searchLower);
      
      if (!commentMatch && !responsibleMatch) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Trie les actions selon l'option spécifiée
 */
export function sortActions(actions: CorrectiveAction[], sortOption: ActionSortOption): CorrectiveAction[] {
  const sortedActions = [...actions];
  
  switch (sortOption) {
    case 'priority_desc':
      return sortedActions.sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority));
    case 'priority_asc':
      return sortedActions.sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority));
    case 'dueDate_asc':
      return sortedActions.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    case 'dueDate_desc':
      return sortedActions.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    case 'status_asc':
      return sortedActions.sort((a, b) => getStatusValue(a.status) - getStatusValue(b.status));
    case 'status_desc':
      return sortedActions.sort((a, b) => getStatusValue(b.status) - getStatusValue(a.status));
    default:
      return sortedActions;
  }
}

/**
 * Convertit une priorité en valeur numérique pour le tri
 */
function getPriorityValue(priority: PriorityLevel): number {
  switch (priority) {
    case PriorityLevel.Low: return 0;
    case PriorityLevel.Medium: return 1;
    case PriorityLevel.High: return 2;
    case PriorityLevel.Critical: return 3;
    default: return 0;
  }
}

/**
 * Convertit un statut en valeur numérique pour le tri
 */
function getStatusValue(status: StatusType): number {
  switch (status) {
    case StatusType.Todo: return 0;
    case StatusType.InProgress: return 1;
    case StatusType.Done: return 2;
    default: return 0;
  }
}

/**
 * Calcule les statistiques des actions
 */
export function calculateActionStats(actions: CorrectiveAction[]) {
  const total = actions.length;
  const completed = actions.filter(a => a.status === StatusType.Done).length;
  const inProgress = actions.filter(a => a.status === StatusType.InProgress).length;
  const todo = actions.filter(a => a.status === StatusType.Todo).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate
  };
}
