
/**
 * Implémentation de l'API des exigences
 */

import { ExigenceApi } from '@/types/api/domain';
import { Exigence } from '@/types/domain';
import { exigenceService } from '../exigenceService';
import { FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR, NOT_FOUND_ERROR } from '@/constants/errorMessages';

export class NotionExigenceApi implements ExigenceApi {
  async getExigences(projectId: string): Promise<Exigence[]> {
    const response = await exigenceService.getExigences(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    return response.data || [];
  }
  
  async getExigenceById(id: string): Promise<Exigence> {
    const response = await exigenceService.getExigenceById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `${NOT_FOUND_ERROR}: Exigence #${id}`);
    }
    return response.data as Exigence;
  }
  
  async createExigence(exigence: Omit<Exigence, 'id'>): Promise<Exigence> {
    const response = await exigenceService.createExigence(exigence);
    if (!response.success) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    return response.data as Exigence;
  }
  
  async updateExigence(exigence: Exigence): Promise<Exigence> {
    const response = await exigenceService.updateExigence(exigence);
    if (!response.success) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    return response.data as Exigence;
  }
  
  async deleteExigence(id: string): Promise<boolean> {
    const response = await exigenceService.deleteExigence(id);
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    return true;
  }
}

export const exigencesApi = new NotionExigenceApi();
