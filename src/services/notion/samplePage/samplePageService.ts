
/**
 * Façade pour le service de pages d'échantillon
 * 
 * Ce fichier expose une interface simplifiée pour le service de pages d'échantillon.
 * Il permet de garder une compatibilité avec le code existant tout en
 * utilisant la nouvelle implémentation basée sur BaseNotionService.
 */

import { samplePageServiceImpl } from './SamplePageServiceImpl';
import { SamplePage } from '@/types/domain';
import { NotionResponse } from '../types';
import { CreateSamplePageInput } from './types';

/**
 * Service de gestion des pages d'échantillon
 * 
 * @deprecated Utilisez directement samplePageServiceImpl pour les nouvelles implémentations
 */
class SamplePageService {
  /**
   * Récupère toutes les pages d'échantillon d'un projet
   */
  getSamplePages(projectId: string): Promise<NotionResponse<SamplePage[]>> {
    return samplePageServiceImpl.getSamplePages(projectId);
  }
  
  /**
   * Récupère une page d'échantillon par son ID
   */
  getSamplePageById(id: string): Promise<NotionResponse<SamplePage>> {
    return samplePageServiceImpl.getSamplePageById(id);
  }
  
  /**
   * Crée une nouvelle page d'échantillon
   */
  createSamplePage(page: Omit<SamplePage, 'id'>): Promise<NotionResponse<SamplePage>> {
    return samplePageServiceImpl.createSamplePage(page as CreateSamplePageInput);
  }
  
  /**
   * Met à jour une page d'échantillon existante
   */
  updateSamplePage(page: SamplePage): Promise<NotionResponse<SamplePage>> {
    return samplePageServiceImpl.updateSamplePage(page);
  }
  
  /**
   * Supprime une page d'échantillon
   */
  deleteSamplePage(id: string): Promise<NotionResponse<boolean>> {
    return samplePageServiceImpl.deleteSamplePage(id);
  }
}

// Créer et exporter une instance singleton
export const samplePageService = new SamplePageService();

// Export par défaut
export default samplePageService;
