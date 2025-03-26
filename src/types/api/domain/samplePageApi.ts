
/**
 * Interface pour l'API des pages d'échantillon
 */

import { SamplePage } from '@/types/domain';

export interface SamplePageApi {
  getSamplePages(projectId: string): Promise<SamplePage[]>;
  getSamplePageById(id: string): Promise<SamplePage>;
  createSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage>;
  updateSamplePage(page: SamplePage): Promise<SamplePage>;
  deleteSamplePage(id: string): Promise<boolean>;
}
