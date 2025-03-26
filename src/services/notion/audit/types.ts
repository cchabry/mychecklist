
/**
 * Types pour le service d'audits
 */

import { Audit } from '@/types/domain';

/**
 * Réponse d'API pour un audit
 */
export interface AuditResponse {
  success: boolean;
  data?: Audit;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Réponse d'API pour une liste d'audits
 */
export interface AuditsResponse {
  success: boolean;
  data?: Audit[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Réponse d'API pour une suppression d'audit
 */
export interface AuditDeleteResponse {
  success: boolean;
  data?: boolean;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Données pour la création d'un nouvel audit
 */
export type CreateAuditInput = Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>;

