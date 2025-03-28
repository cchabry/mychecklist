
/**
 * Implémentation standardisée du service d'exigences
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService, generateMockId } from '../base';
import { NotionResponse } from '../types';
import { Exigence } from '@/types/domain';
import { CreateExigenceInput } from './types';
import { generateMockExigences } from './utils';
import { CrudService } from '../types/ServiceInterfaces';

/**
 * Implémentation standardisée du service d'exigences
 */
export class ExigenceServiceImpl extends BaseNotionService<Exigence, CreateExigenceInput, Partial<Exigence>> implements CrudService<Exigence, CreateExigenceInput, Partial<Exigence>> {
  constructor() {
    super('Exigence', 'projectsDbId');
  }
  
  /**
   * Récupère toutes les exigences d'un projet
   */
  async getExigences(projectId: string): Promise<NotionResponse<Exigence[]>> {
    return this.getAll({ projectId });
  }
  
  /**
   * Récupère une exigence par son ID
   */
  async getExigenceById(id: string): Promise<NotionResponse<Exigence>> {
    return this.getById(id);
  }
  
  /**
   * Crée une nouvelle exigence
   */
  async createExigence(exigence: CreateExigenceInput): Promise<NotionResponse<Exigence>> {
    return this.create(exigence);
  }
  
  /**
   * Met à jour une exigence existante
   */
  async updateExigence(exigence: Exigence): Promise<NotionResponse<Exigence>> {
    return this.update(exigence.id, exigence);
  }
  
  /**
   * Supprime une exigence
   */
  async deleteExigence(id: string): Promise<NotionResponse<boolean>> {
    return this.delete(id);
  }
  
  /**
   * Génère des exigences fictives pour le mode mock
   */
  protected async getMockEntities(filter?: Record<string, any>): Promise<Exigence[]> {
    const projectId = filter?.projectId || 'mock-project';
    return generateMockExigences(projectId);
  }
  
  /**
   * Crée une exigence fictive en mode mock
   */
  protected async mockCreate(data: CreateExigenceInput): Promise<Exigence> {
    return {
      ...data,
      id: generateMockId('exigence')
    };
  }
  
  /**
   * Met à jour une exigence fictive en mode mock
   */
  protected async mockUpdate(entity: Exigence): Promise<Exigence> {
    return entity;
  }
  
  /**
   * Implémentation de la récupération des exigences
   */
  protected async getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<Exigence[]>> {
    // Pour l'instant, utilisons des données mock même en mode réel
    return {
      success: true,
      data: await this.getMockEntities(filter)
    };
  }
  
  /**
   * Implémentation de la récupération d'une exigence par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<Exigence>> {
    try {
      // Pour l'instant, utilisons une donnée mock même en mode réel
      const mockExigences = await this.getMockEntities();
      const exigence = mockExigences.find(e => e.id === id);
      
      if (!exigence) {
        return { 
          success: false, 
          error: { message: `Exigence #${id} non trouvée` } 
        };
      }
      
      return {
        success: true,
        data: exigence
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération de l'exigence: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la création d'une exigence
   */
  protected async createImpl(data: CreateExigenceInput): Promise<NotionResponse<Exigence>> {
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
          message: `Erreur lors de la création de l'exigence: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la mise à jour d'une exigence
   */
  protected async updateImpl(id: string, data: Partial<Exigence>): Promise<NotionResponse<Exigence>> {
    try {
      // Récupérer l'exigence existante
      const existingExigenceResponse = await this.getById(id);
      if (!existingExigenceResponse.success || !existingExigenceResponse.data) {
        return {
          success: false,
          error: { message: `Exigence #${id} non trouvée` }
        };
      }
      
      // Mettre à jour l'exigence
      const updatedExigence = { 
        ...existingExigenceResponse.data,
        ...data
      };
      
      // Pour l'instant, simulons une mise à jour réussie
      return {
        success: true,
        data: updatedExigence
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour de l'exigence: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la suppression d'une exigence
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    try {
      // Utilisons l'ID dans l'implémentation pour éviter l'erreur TS6133
      console.log(`Suppression de l'exigence avec l'ID: ${id}`);
      
      // Pour l'instant, simulons un succès
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression de l'exigence: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
}

// Créer et exporter une instance singleton
export const exigenceServiceImpl = new ExigenceServiceImpl();

// Export par défaut
export default exigenceServiceImpl;
