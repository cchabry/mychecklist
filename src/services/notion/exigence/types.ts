
/**
 * Types pour les services d'exigences
 */

import { Exigence } from '@/types/domain';

/**
 * Type pour la création d'une exigence
 */
export type CreateExigenceInput = Omit<Exigence, 'id'>;

/**
 * Type pour la mise à jour d'une exigence
 */
export type UpdateExigenceInput = Exigence;

