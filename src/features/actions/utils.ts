
/**
 * Utilitaires pour la feature Actions
 */

import { CorrectiveAction, ActionFilters, ActionSortOption } from './types';

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
      return sortedActions.sort((a, b) => b.priority - a.priority);
    case 'priority_asc':
      return sortedActions.sort((a, b) => a.priority - b.priority);
    case 'dueDate_asc':
      return sortedActions.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    case 'dueDate_desc':
      return sortedActions.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    case 'status_asc':
      return sortedActions.sort((a, b) => a.status - b.status);
    case 'status_desc':
      return sortedActions.sort((a, b) => b.status - a.status);
    default:
      return sortedActions;
  }
}

/**
 * Calcule les statistiques des actions
 */
export function calculateActionStats(actions: CorrectiveAction[]) {
  const total = actions.length;
  const completed = actions.filter(a => a.status === 2).length; // StatusType.Done = 2
  const inProgress = actions.filter(a => a.status === 1).length; // StatusType.InProgress = 1
  const todo = actions.filter(a => a.status === 0).length; // StatusType.Todo = 0
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate
  };
}
