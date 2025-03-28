
/**
 * Types pour les pages d'échantillon
 */

/**
 * Interface pour une page d'échantillon
 * 
 * Une page d'échantillon est une page spécifique d'un projet qui sera évaluée
 * lors de l'audit.
 */
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}
