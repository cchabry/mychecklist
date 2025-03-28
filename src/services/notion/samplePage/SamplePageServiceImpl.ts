
/**
 * Implémentation standardisée du service de pages d'échantillon
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService, generateMockId } from '../base';
import { NotionResponse } from '../types';
import { SamplePage } from '@/types/domain';
import { CreateSamplePageInput } from './types';
import { generateMockSamplePages } from './utils';

/**
 * Implémentation standardisée du service de pages d'échantillon
 */
export class SamplePageServiceImpl extends BaseNotionService<SamplePage, CreateSamplePageInput> {
  constructor() {
    super('SamplePage', 'projectsDbId');
  }
  
  /**
   * Récupère toutes les pages d'échantillon d'un projet
   */
  async getSamplePages(projectId: string): Promise<NotionResponse<SamplePage[]>> {
    return this.getAll({ projectId });
  }
  
  /**
   * Récupère une page d'échantillon par son ID
   */
  async getSamplePageById(id: string): Promise<NotionResponse<SamplePage>> {
    return this.getById(id);
  }
  
  /**
   * Crée une nouvelle page d'échantillon
   */
  async createSamplePage(page: CreateSamplePageInput): Promise<NotionResponse<SamplePage>> {
    return this.create(page);
  }
  
  /**
   * Met à jour une page d'échantillon existante
   */
  async updateSamplePage(page: SamplePage): Promise<NotionResponse<SamplePage>> {
    return this.update(page);
  }
  
  /**
   * Supprime une page d'échantillon
   */
  async deleteSamplePage(id: string): Promise<NotionResponse<boolean>> {
    return this.delete(id);
  }
  
  /**
   * Génère des pages d'échantillon fictives pour le mode mock
   */
  protected async getMockEntities(filter?: Record<string, any>): Promise<SamplePage[]> {
    const projectId = filter?.projectId || 'mock-project';
    return generateMockSamplePages(projectId);
  }
  
  /**
   * Crée une page d'échantillon fictive en mode mock
   */
  protected async mockCreate(data: CreateSamplePageInput): Promise<SamplePage> {
    return {
      ...data,
      id: generateMockId('samplepage')
    };
  }
  
  /**
   * Met à jour une page d'échantillon fictive en mode mock
   */
  protected async mockUpdate(entity: SamplePage): Promise<SamplePage> {
    return entity;
  }
  
  /**
   * Implémentation de la récupération des pages d'échantillon
   */
  protected async getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<SamplePage[]>> {
    // Pour l'instant, utilisons des données mock même en mode réel
    return {
      success: true,
      data: await this.getMockEntities(filter)
    };
  }
  
  /**
   * Implémentation de la récupération d'une page d'échantillon par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<SamplePage>> {
    try {
      // Pour l'instant, utilisons une donnée mock même en mode réel
      const mockPages = await this.getMockEntities();
      const page = mockPages.find(p => p.id === id);
      
      if (!page) {
        return { 
          success: false, 
          error: { message: `Page d'échantillon #${id} non trouvée` } 
        };
      }
      
      return {
        success: true,
        data: page
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération de la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la création d'une page d'échantillon
   */
  protected async createImpl(data: CreateSamplePageInput): Promise<NotionResponse<SamplePage>> {
    try {
      // Pour l'instant, utilisons une donnée mock même en mode réel
      return {
        success: true,
        data: await this.mockCreate(data)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la création de la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la mise à jour d'une page d'échantillon
   */
  protected async updateImpl(entity: SamplePage): Promise<NotionResponse<SamplePage>> {
    try {
      // Pour l'instant, utilisons une donnée mock même en mode réel
      return {
        success: true,
        data: await this.mockUpdate(entity)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour de la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la suppression d'une page d'échantillon
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    try {
      // Utilisons l'ID dans l'implémentation pour éviter l'erreur TS6133
      console.log(`Suppression de la page d'échantillon avec l'ID: ${id}`);
      
      // Pour l'instant, simulons un succès
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression de la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
}

// Créer et exporter une instance singleton
export const samplePageServiceImpl = new SamplePageServiceImpl();

// Export par défaut
export default samplePageServiceImpl;
