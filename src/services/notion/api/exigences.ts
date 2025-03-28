
/**
 * API Notion pour les exigences
 */

import { ExigenceApi, CreateExigenceData, UpdateExigenceData } from '@/types/api/domain/exigenceApi';
import { exigenceService } from '../exigence';
import { Exigence } from '@/types/domain';
import { 
  DELETE_ERROR, 
  FETCH_ERROR, 
  CREATE_ERROR, 
  UPDATE_ERROR 
} from '@/constants/errorMessages';

/**
 * Implémentation de l'API des exigences utilisant le service Notion
 */
class NotionExigenceApi implements ExigenceApi {
  /**
   * Récupère toutes les exigences d'un projet
   */
  async getExigences(projectId: string): Promise<Exigence[]> {
    const response = await exigenceService.getExigencesByProject(projectId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Récupère une exigence par son ID
   */
  async getExigenceById(id: string): Promise<Exigence | null> {
    const response = await exigenceService.getExigenceById(id);
    
    if (!response.success) {
      return null;
    }
    
    return response.data || null;
  }
  
  /**
   * Crée une nouvelle exigence
   */
  async createExigence(data: CreateExigenceData): Promise<Exigence> {
    const response = await exigenceService.createExigence(data as Omit<Exigence, 'id'>);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Met à jour une exigence existante
   */
  async updateExigence(exigence: Exigence): Promise<Exigence> {
    const response = await exigenceService.updateExigence(exigence);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Supprime une exigence
   */
  async deleteExigence(id: string): Promise<boolean> {
    const response = await exigenceService.deleteExigence(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    
    return response.data ?? false;
  }
}

// Exporter une instance singleton
export const exigencesApi = new NotionExigenceApi();

// Export par défaut
export default exigencesApi;
