
/**
 * Façade pour le service d'exigences
 * 
 * Ce fichier expose une interface simplifiée pour le service d'exigences.
 * Il permet de garder une compatibilité avec le code existant tout en
 * utilisant la nouvelle implémentation basée sur BaseNotionService.
 */

import { exigenceServiceImpl } from './ExigenceServiceImpl';
import { Exigence } from '@/types/domain';
import { NotionResponse } from '../types';
import { CreateExigenceInput } from './types';

/**
 * Service de gestion des exigences
 * 
 * @deprecated Utilisez directement exigenceServiceImpl pour les nouvelles implémentations
 */
class ExigenceService {
  /**
   * Récupère toutes les exigences d'un projet
   */
  getExigences(projectId: string): Promise<NotionResponse<Exigence[]>> {
    return exigenceServiceImpl.getExigences(projectId);
  }
  
  /**
   * Récupère une exigence par son ID
   */
  getExigenceById(id: string): Promise<NotionResponse<Exigence>> {
    return exigenceServiceImpl.getExigenceById(id);
  }
  
  /**
   * Crée une nouvelle exigence
   */
  createExigence(exigence: Omit<Exigence, 'id'>): Promise<NotionResponse<Exigence>> {
    return exigenceServiceImpl.createExigence(exigence as CreateExigenceInput);
  }
  
  /**
   * Met à jour une exigence existante
   */
  updateExigence(exigence: Exigence): Promise<NotionResponse<Exigence>> {
    return exigenceServiceImpl.updateExigence(exigence);
  }
  
  /**
   * Supprime une exigence
   */
  deleteExigence(id: string): Promise<NotionResponse<boolean>> {
    return exigenceServiceImpl.deleteExigence(id);
  }
}

// Créer et exporter une instance singleton
export const exigenceService = new ExigenceService();

// Export par défaut
export default exigenceService;
