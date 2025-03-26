
/**
 * Implémentation de l'API des exigences
 */

import { ExigenceApi } from '@/types/api/domain';
import { Exigence } from '@/types/domain';
import { exigenceService } from '../exigenceService';

export class NotionExigenceApi implements ExigenceApi {
  async getExigences(projectId: string): Promise<Exigence[]> {
    const response = await exigenceService.getExigences(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des exigences");
    }
    return response.data || [];
  }
  
  async getExigenceById(id: string): Promise<Exigence> {
    const response = await exigenceService.getExigenceById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Exigence #${id} non trouvée`);
    }
    return response.data as Exigence;
  }
  
  async createExigence(exigence: Omit<Exigence, 'id'>): Promise<Exigence> {
    const response = await exigenceService.createExigence(exigence);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'exigence");
    }
    return response.data as Exigence;
  }
  
  async updateExigence(exigence: Exigence): Promise<Exigence> {
    const response = await exigenceService.updateExigence(exigence);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'exigence");
    }
    return response.data as Exigence;
  }
  
  async deleteExigence(id: string): Promise<boolean> {
    const response = await exigenceService.deleteExigence(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'exigence");
    }
    return true;
  }
}

export const exigencesApi = new NotionExigenceApi();
