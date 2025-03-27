
/**
 * Utilitaires pour les hooks de requêtes
 */

import { toast } from 'sonner';

// Messages pour les opérations réussies
const SUCCESS_MESSAGES = {
  create: (entity: string) => `${entity} créé(e) avec succès`,
  update: (entity: string) => `${entity} mis(e) à jour avec succès`,
  delete: (entity: string) => `${entity} supprimé(e) avec succès`,
  import: (entity: string) => `${entity} importé(e) avec succès`,
  export: (entity: string) => `${entity} exporté(e) avec succès`,
  validate: (entity: string) => `${entity} validé(e) avec succès`,
  complete: (entity: string) => `${entity} terminé(e) avec succès`,
  publish: (entity: string) => `${entity} publié(e) avec succès`,
  archive: (entity: string) => `${entity} archivé(e) avec succès`,
  restore: (entity: string) => `${entity} restauré(e) avec succès`,
};

// Messages pour les erreurs
const ERROR_MESSAGES = {
  create: (entity: string) => `Erreur lors de la création de ${entity}`,
  update: (entity: string) => `Erreur lors de la mise à jour de ${entity}`,
  delete: (entity: string) => `Erreur lors de la suppression de ${entity}`,
  import: (entity: string) => `Erreur lors de l'importation de ${entity}`,
  export: (entity: string) => `Erreur lors de l'exportation de ${entity}`,
  validate: (entity: string) => `Erreur lors de la validation de ${entity}`,
  complete: (entity: string) => `Erreur lors de la terminaison de ${entity}`,
  publish: (entity: string) => `Erreur lors de la publication de ${entity}`,
  archive: (entity: string) => `Erreur lors de l'archivage de ${entity}`,
  restore: (entity: string) => `Erreur lors de la restauration de ${entity}`,
};

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
 * Affiche une notification de succès pour une mutation
 * 
 * @param entityName - Nom de l'entité concernée (ex: "Projet", "Audit")
 * @param operation - Opération effectuée
 */
export const handleMutationSuccess = (
  entityName: string,
  operation: MutationOperation
) => {
  const getMessage = SUCCESS_MESSAGES[operation];
  
  if (getMessage) {
    toast.success(getMessage(entityName));
  } else {
    toast.success(`Opération réussie`);
  }
};

/**
 * Affiche une notification d'erreur pour une mutation
 * 
 * @param error - Erreur rencontrée
 * @param entityName - Nom de l'entité concernée (ex: "Projet", "Audit")
 * @param operation - Opération qui a échoué
 */
export const handleMutationError = (
  error: unknown,
  entityName: string,
  operation: MutationOperation
) => {
  const getMessage = ERROR_MESSAGES[operation];
  
  console.error(`Erreur lors de l'opération ${operation} sur ${entityName}:`, error);
  
  if (getMessage) {
    toast.error(getMessage(entityName));
  } else {
    toast.error(`Erreur lors de l'opération`);
  }
};
