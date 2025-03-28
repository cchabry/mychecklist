/**
 * Service pour la gestion des exigences
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { Exigence } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';

/**
 * Service pour la gestion des exigences
 */
class ExigenceService {
  /**
   * Récupère toutes les exigences d'un projet
   */
  async getExigences(projectId: string): Promise<NotionResponse<Exigence[]>> {
    const config = notionClient.getConfig();
    
    if (!config?.exigencesDbId) {
      return { 
        success: false, 
        error: { message: "Base de données des exigences non configurée" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: this.getMockExigences(projectId)
      };
    }
    
    // TODO: Implémenter la récupération des exigences depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: this.getMockExigences(projectId)
    };
  }
  
  /**
   * Récupère une exigence par son ID
   */
  async getExigenceById(id: string): Promise<NotionResponse<Exigence>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockExigences = this.getMockExigences('mock-project');
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
    }
    
    // TODO: Implémenter la récupération d'une exigence depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        id,
        projectId: 'mock-project',
        itemId: 'mock-item',
        importance: ImportanceLevel.Important,
        comment: "Cette exigence est importante pour le projet"
      }
    };
  }
  
  /**
   * Crée une nouvelle exigence
   */
  async createExigence(exigence: Omit<Exigence, 'id'>): Promise<NotionResponse<Exigence>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newExigence: Exigence = {
        ...exigence,
        id: `exig-${Date.now()}`
      };
      
      return {
        success: true,
        data: newExigence
      };
    }
    
    // TODO: Implémenter la création d'une exigence dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...exigence,
        id: `exig-${Date.now()}`
      }
    };
  }
  
  /**
   * Met à jour une exigence existante
   */
  async updateExigence(exigence: Exigence): Promise<NotionResponse<Exigence>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: exigence
      };
    }
    
    // TODO: Implémenter la mise à jour d'une exigence dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: exigence
    };
  }
  
  /**
   * Supprime une exigence
   */
  async deleteExigence(_id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'une exigence dans Notion
    // Pour l'instant, simuler le succès même en mode réel
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Génère des exigences fictives pour le mode démo
   */
  private getMockExigences(projectId: string): Exigence[] {
    return [
      {
        id: 'exig-1',
        projectId,
        itemId: 'check-1',
        importance: ImportanceLevel.Major,
        comment: "Crucial pour l'accessibilité du site"
      },
      {
        id: 'exig-2',
        projectId,
        itemId: 'check-2',
        importance: ImportanceLevel.Medium,
        comment: "Important pour les performances mobiles"
      },
      {
        id: 'exig-3',
        projectId,
        itemId: 'check-3',
        importance: ImportanceLevel.Important,
        comment: "Nécessaire pour le respect des standards RGAA"
      }
    ];
  }
}

// Créer et exporter une instance singleton
export const exigenceService = new ExigenceService();

// Export par défaut
export default exigenceService;
