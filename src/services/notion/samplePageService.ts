
/**
 * Service pour la gestion des pages d'échantillon via Notion
 * 
 * Ce service fournit des méthodes pour interagir avec les pages d'échantillon
 * stockées dans la base de données Notion, avec prise en charge du mode démonstration.
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { SamplePage } from '@/types/domain';

/**
 * Service de gestion des pages d'échantillon
 */
class SamplePageService {
  /**
   * Récupère toutes les pages d'échantillon d'un projet
   * 
   * @param projectId - Identifiant du projet
   * @returns Réponse contenant la liste des pages d'échantillon ou une erreur
   */
  async getSamplePages(projectId: string): Promise<NotionResponse<SamplePage[]>> {
    const config = notionClient.getConfig();
    
    if (!config.projectsDbId) {
      return { 
        success: false, 
        error: { message: "Base de données des projets non configurée" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: this.getMockSamplePages(projectId)
      };
    }
    
    // TODO: Implémenter la récupération des pages d'échantillon depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: this.getMockSamplePages(projectId)
    };
  }
  
  /**
   * Récupère une page d'échantillon par son ID
   * 
   * @param id - Identifiant unique de la page
   * @returns Réponse contenant la page d'échantillon ou une erreur
   */
  async getSamplePageById(id: string): Promise<NotionResponse<SamplePage>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockPages = this.getMockSamplePages('mock-project');
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
    }
    
    // TODO: Implémenter la récupération d'une page d'échantillon depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        id,
        projectId: 'mock-project',
        url: 'https://example.com',
        title: 'Page exemple',
        order: 1
      }
    };
  }
  
  /**
   * Crée une nouvelle page d'échantillon
   * 
   * @param page - Données de la page à créer
   * @returns Réponse contenant la page créée ou une erreur
   */
  async createSamplePage(page: Omit<SamplePage, 'id'>): Promise<NotionResponse<SamplePage>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newPage: SamplePage = {
        ...page,
        id: `page-${Date.now()}`
      };
      
      return {
        success: true,
        data: newPage
      };
    }
    
    // TODO: Implémenter la création d'une page d'échantillon dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...page,
        id: `page-${Date.now()}`
      }
    };
  }
  
  /**
   * Met à jour une page d'échantillon existante
   * 
   * @param page - Données complètes de la page à mettre à jour
   * @returns Réponse contenant la page mise à jour ou une erreur
   */
  async updateSamplePage(page: SamplePage): Promise<NotionResponse<SamplePage>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: page
      };
    }
    
    // TODO: Implémenter la mise à jour d'une page d'échantillon dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: page
    };
  }
  
  /**
   * Supprime une page d'échantillon
   * 
   * @param id - Identifiant de la page à supprimer
   * @returns Réponse indiquant le succès ou l'échec de l'opération
   */
  async deleteSamplePage(_id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'une page d'échantillon dans Notion
    // Pour l'instant, simuler le succès même en mode réel
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Génère des pages d'échantillon fictives pour le mode démo
   * 
   * @param projectId - Identifiant du projet
   * @returns Tableau de pages d'échantillon
   * @private
   */
  private getMockSamplePages(projectId: string): SamplePage[] {
    return [
      {
        id: 'page-1',
        projectId,
        url: 'https://example.com',
        title: "Page d'accueil",
        description: "Page principale du site",
        order: 1
      },
      {
        id: 'page-2',
        projectId,
        url: 'https://example.com/about',
        title: "À propos",
        description: "Présentation de l'entreprise",
        order: 2
      },
      {
        id: 'page-3',
        projectId,
        url: 'https://example.com/contact',
        title: "Contact",
        description: "Formulaire de contact",
        order: 3
      }
    ];
  }
}

// Créer et exporter une instance singleton
export const samplePageService = new SamplePageService();

// Export par défaut
export default samplePageService;
