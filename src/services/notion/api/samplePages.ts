
/**
 * Implémentation de l'API des pages d'échantillon
 */

import { SamplePageApi } from '@/types/api/domain';
import { SamplePage } from '@/types/domain';
import { samplePageService } from '../samplePageService';

export class NotionSamplePageApi implements SamplePageApi {
  async getSamplePages(projectId: string): Promise<SamplePage[]> {
    const response = await samplePageService.getSamplePages(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des pages d'échantillon");
    }
    return response.data || [];
  }
  
  async getSamplePageById(id: string): Promise<SamplePage> {
    const response = await samplePageService.getSamplePageById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Page d'échantillon #${id} non trouvée`);
    }
    return response.data as SamplePage;
  }
  
  async createSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage> {
    const response = await samplePageService.createSamplePage(page);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de la page d'échantillon");
    }
    return response.data as SamplePage;
  }
  
  async updateSamplePage(page: SamplePage): Promise<SamplePage> {
    const response = await samplePageService.updateSamplePage(page);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de la page d'échantillon");
    }
    return response.data as SamplePage;
  }
  
  async deleteSamplePage(id: string): Promise<boolean> {
    const response = await samplePageService.deleteSamplePage(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de la page d'échantillon");
    }
    return true;
  }
}

export const samplePagesApi = new NotionSamplePageApi();
