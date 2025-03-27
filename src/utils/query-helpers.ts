
/**
 * Utilitaires pour standardiser l'utilisation de React Query
 * 
 * Ce module fournit des fonctions utilitaires pour simplifier et
 * standardiser l'implémentation des hooks React Query à travers l'application.
 */

import { toast } from 'sonner';

/**
 * Options pour les messages de succès
 */
export interface SuccessMessageOptions {
  title?: string;
  description?: string;
  showToast?: boolean;
}

/**
 * Options pour les messages d'erreur
 */
export interface ErrorMessageOptions {
  title?: string;
  description?: string;
  showToast?: boolean;
  logToConsole?: boolean;
}

/**
 * Affiche un message de succès
 */
export function handleMutationSuccess(
  entityName: string, 
  action: 'create' | 'update' | 'delete', 
  options?: SuccessMessageOptions
) {
  if (options?.showToast === false) return;
  
  const title = options?.title || getDefaultSuccessTitle(entityName, action);
  const description = options?.description || '';
  
  toast.success(title, description ? { description } : undefined);
}

/**
 * Affiche un message d'erreur
 */
export function handleMutationError(
  error: unknown, 
  entityName: string, 
  action: 'create' | 'update' | 'delete',
  options?: ErrorMessageOptions
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (options?.logToConsole !== false) {
    console.error(`Erreur lors de l'action ${action} sur ${entityName}:`, error);
  }
  
  if (options?.showToast !== false) {
    const title = options?.title || getDefaultErrorTitle(action);
    const description = options?.description || `Impossible de ${getActionVerb(action)} ${entityName}: ${errorMessage}`;
    
    toast.error(title, { description });
  }
}

/**
 * Retourne un titre par défaut pour un message de succès
 */
function getDefaultSuccessTitle(entityName: string, action: 'create' | 'update' | 'delete'): string {
  switch (action) {
    case 'create':
      return `${entityName} créé`;
    case 'update':
      return `${entityName} mis à jour`;
    case 'delete':
      return `${entityName} supprimé`;
  }
}

/**
 * Retourne un titre par défaut pour un message d'erreur
 */
function getDefaultErrorTitle(action: 'create' | 'update' | 'delete'): string {
  switch (action) {
    case 'create':
      return `Erreur de création`;
    case 'update':
      return `Erreur de mise à jour`;
    case 'delete':
      return `Erreur de suppression`;
  }
}

/**
 * Retourne le verbe correspondant à une action
 */
function getActionVerb(action: 'create' | 'update' | 'delete'): string {
  switch (action) {
    case 'create':
      return 'créer';
    case 'update':
      return 'mettre à jour';
    case 'delete':
      return 'supprimer';
  }
}
