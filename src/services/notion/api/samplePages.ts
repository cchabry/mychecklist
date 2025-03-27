
/**
 * Implémentation de l'API des pages d'échantillon
 */

import { SamplePageApi } from '@/types/api/domain';
import { SamplePage } from '@/types/domain';
import { samplePageService } from '../samplePageService';
import { FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR, NOT_FOUND_ERROR } from '@/constants/errorMessages';

export class NotionSamplePageApi implements SamplePageApi {
  async getSamplePages(projectId: string): Promise<SamplePage[]> {
    const response = await samplePageService.getSamplePages(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    return response.data || [];
  }
  
  async getSamplePageById(id: string): Promise<SamplePage> {
    const response = await samplePageService.getSamplePageById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `${NOT_FOUND_ERROR}: Page d'échantillon #${id}`);
    }
    return response.data as SamplePage;
  }
  
  async createSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage> {
    const response = await samplePageService.createSamplePage(page);
    if (!response.success) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    return response.data as SamplePage;
  }
  
  async updateSamplePage(page: SamplePage): Promise<SamplePage> {
    const response = await samplePageService.updateSamplePage(page);
    if (!response.success) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    return response.data as SamplePage;
  }
  
  async deleteSamplePage(id: string): Promise<boolean> {
    const response = await samplePageService.deleteSamplePage(id);
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    return true;
  }
}

export const samplePagesApi = new NotionSamplePageApi();
