
/**
 * Utilitaires pour les opérations React Query
 * 
 * Ce fichier fournit des fonctions réutilisables pour gérer les succès
 * et les erreurs des mutations React Query de manière cohérente.
 */

import { toast } from 'sonner';

type MutationContext = {
  entity: string;
  action: 'create' | 'update' | 'delete';
};

/**
 * Gère le succès d'une mutation de manière standardisée
 * 
 * @param context Contexte de la mutation (entité et action)
 */
export function handleMutationSuccess(context: MutationContext): void {
  const { entity, action } = context;
  
  const actionFr = action === 'create' 
    ? 'créé' 
    : action === 'update' 
      ? 'mis à jour' 
      : 'supprimé';
  
  toast.success(`${entity} ${actionFr}`, {
    description: `${entity} ${actionFr} avec succès.`
  });
}

/**
 * Gère les erreurs de mutation de manière standardisée
 * 
 * @param error Erreur survenue
 * @param context Contexte de la mutation (entité et action)
 */
export function handleMutationError(error: unknown, context: MutationContext): void {
  const { entity, action } = context;
  
  const actionFr = action === 'create' 
    ? 'créer' 
    : action === 'update' 
      ? 'mettre à jour' 
      : 'supprimer';
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Une erreur inconnue est survenue';
  
  console.error(`Erreur lors de l'action ${action} sur ${entity}:`, error);
  
  toast.error(`Impossible de ${actionFr} ${entity}`, {
    description: errorMessage
  });
}
