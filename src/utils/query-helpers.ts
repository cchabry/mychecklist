
/**
 * Utilitaires pour les hooks de requêtes
 */

import { toast } from 'sonner';

// Type pour les opérations possibles
export type MutationOperation = 
  | 'create'
  | 'update'
  | 'delete'
  | 'import'
  | 'export'
  | 'validate'
  | 'complete'
  | 'publish'
  | 'archive'
  | 'restore';

/**
 * Gère le succès d'une mutation en affichant un toast de confirmation
 * 
 * @param params - Paramètres pour le message de succès
 */
export function handleMutationSuccess(params: { 
  entity: string; 
  action: 'create' | 'update' | 'delete'; 
  options?: { 
    title?: string; 
    description?: string; 
    showToast?: boolean;
  }
}) {
  const { entity, action, options = {} } = params;
  const { title, description, showToast = true } = options;
  
  if (!showToast) return;
  
  const defaultTitles = {
    create: `${entity} créé`,
    update: `${entity} mis à jour`,
    delete: `${entity} supprimé`
  };
  
  const defaultDescriptions = {
    create: `Le ${entity.toLowerCase()} a été créé avec succès`,
    update: `Le ${entity.toLowerCase()} a été mis à jour avec succès`,
    delete: `Le ${entity.toLowerCase()} a été supprimé avec succès`
  };
  
  toast.success(title || defaultTitles[action], {
    description: description || defaultDescriptions[action]
  });
}

/**
 * Gère l'erreur d'une mutation en affichant un toast d'erreur
 * 
 * @param error - L'erreur survenue
 * @param params - Paramètres pour le message d'erreur
 */
export function handleMutationError(error: unknown, params: {
  entity: string;
  action: 'create' | 'update' | 'delete';
  options?: {
    title?: string;
    description?: string;
    showToast?: boolean;
    logToConsole?: boolean;
  }
}) {
  const { entity, action, options = {} } = params;
  const { 
    title, 
    description, 
    showToast = true,
    logToConsole = true
  } = options;
  
  if (logToConsole) {
    console.error(`Erreur lors de l'action '${action}' sur ${entity}:`, error);
  }
  
  if (!showToast) return;
  
  const defaultTitles = {
    create: `Erreur de création`,
    update: `Erreur de mise à jour`,
    delete: `Erreur de suppression`
  };
  
  const defaultDescriptions = {
    create: `Impossible de créer ${entity.toLowerCase()}`,
    update: `Impossible de mettre à jour ${entity.toLowerCase()}`,
    delete: `Impossible de supprimer ${entity.toLowerCase()}`
  };
  
  toast.error(title || defaultTitles[action], {
    description: description || defaultDescriptions[action]
  });
}
