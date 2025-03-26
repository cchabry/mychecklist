
/**
 * Types spécifiques aux audits
 * 
 * Ce fichier définit les types utilisés dans la fonctionnalité de gestion des audits
 */

import { Audit } from '@/types/domain/audit';

export type { Audit };

/**
 * Type pour la création d'un audit
 */
export type CreateAuditData = {
  projectId: string;
  name: string;
  description?: string;
};

/**
 * Type pour la mise à jour d'un audit
 */
export type UpdateAuditData = {
  name?: string;
  description?: string;
  status?: string;
};
