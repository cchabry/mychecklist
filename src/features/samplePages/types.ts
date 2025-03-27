
/**
 * Types pour la feature SamplePages
 */

// Re-export avec 'export type' pour isolatedModules
export type { SamplePage } from '@/types/domain';

/**
 * Type pour les filtres de pages d'échantillon
 */
export interface SamplePageFilters {
  search?: string;
}

/**
 * Type pour la création d'une page d'échantillon
 */
export type CreateSamplePageData = {
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
};

/**
 * Type pour la mise à jour d'une page d'échantillon
 */
export type UpdateSamplePageData = {
  url?: string;
  title?: string;
  description?: string;
  order?: number;
};
