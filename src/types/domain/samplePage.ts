
/**
 * Type représentant une page d'échantillon
 */
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}
