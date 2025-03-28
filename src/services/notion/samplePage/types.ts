
/**
 * Types pour les services de pages d'échantillon
 */

import { SamplePage } from '@/types/domain';

/**
 * Type pour la création d'une page d'échantillon
 */
export type CreateSamplePageInput = Omit<SamplePage, 'id'>;

/**
 * Type pour la mise à jour d'une page d'échantillon
 */
export type UpdateSamplePageInput = SamplePage;
