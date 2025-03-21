
import { notionApi } from '@/lib/notionProxy';
import { Exigence, ImportanceLevel } from '@/lib/types';
import { cacheService } from '../cache';

// Clé de cache pour les exigences par projet
const getCacheKey = (projectId: string) => `exigences_${projectId}`;

/**
 * Service pour gérer les exigences des projets dans Notion
 */
const exigencesService = {
  /**
   * Récupère toutes les exigences pour un projet
   * @param projectId ID du projet
   * @param forceRefresh Forcer le rafraîchissement du cache
   */
  async getExigencesByProject(projectId: string, forceRefresh = false): Promise<Exigence[]> {
    const cacheKey = getCacheKey(projectId);
    
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedData = cacheService.get<Exigence[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    try {
      // Appeler l'API Notion via le proxy
      const response = await notionApi.request(`/exigences/${projectId}`);
      
      if (response) {
        // Mettre en cache les résultats
        cacheService.set(cacheKey, response);
        
        return response;
      } else {
        console.error('Erreur lors de la récupération des exigences');
        throw new Error('Erreur lors de la récupération des exigences');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des exigences:', error);
      throw error;
    }
  },
  
  /**
   * Sauvegarde une exigence (création ou mise à jour)
   * @param exigence Exigence à sauvegarder
   */
  async saveExigence(exigence: Exigence): Promise<Exigence> {
    try {
      // Si c'est une nouvelle exigence, créer. Sinon, mettre à jour.
      if (exigence.id === 'new' || !exigence.id) {
        return this.createExigence(exigence);
      } else {
        return this.updateExigence(exigence.id, exigence);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'exigence:', error);
      throw error;
    }
  },
  
  /**
   * Crée une nouvelle exigence
   * @param exigence Données de l'exigence
   */
  async createExigence(exigence: Exigence): Promise<Exigence> {
    try {
      const response = await notionApi.request('/exigences', 'POST', {
        projectId: exigence.projectId,
        itemId: exigence.itemId,
        importance: exigence.importance,
        comment: exigence.comment || ''
      });
      
      if (response) {
        // Invalider le cache pour ce projet
        cacheService.remove(getCacheKey(exigence.projectId));
        
        return response;
      } else {
        console.error('Erreur lors de la création de l\'exigence');
        throw new Error('Erreur lors de la création de l\'exigence');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'exigence:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour une exigence existante
   * @param exigenceId ID de l'exigence
   * @param data Données à mettre à jour
   */
  async updateExigence(exigenceId: string, data: Partial<Exigence>): Promise<Exigence> {
    try {
      const response = await notionApi.request(`/exigences/${exigenceId}`, 'PUT', {
        importance: data.importance,
        comment: data.comment || ''
      });
      
      if (response) {
        // Invalider le cache pour ce projet
        if (data.projectId) {
          cacheService.remove(getCacheKey(data.projectId));
        }
        
        return response;
      } else {
        console.error('Erreur lors de la mise à jour de l\'exigence');
        throw new Error('Erreur lors de la mise à jour de l\'exigence');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'exigence:', error);
      throw error;
    }
  },
  
  /**
   * Supprime une exigence
   * @param exigenceId ID de l'exigence
   * @param projectId ID du projet
   */
  async deleteExigence(exigenceId: string, projectId: string): Promise<boolean> {
    try {
      const response = await notionApi.request(`/exigences/${exigenceId}`, 'DELETE');
      
      if (response) {
        // Invalider le cache pour ce projet
        cacheService.remove(getCacheKey(projectId));
        
        return true;
      } else {
        console.error('Erreur lors de la suppression de l\'exigence');
        throw new Error('Erreur lors de la suppression de l\'exigence');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'exigence:', error);
      throw error;
    }
  },
  
  /**
   * Vide le cache
   */
  clearCache(): void {
    // On ne peut pas supprimer toutes les exigences en une seule fois
    // car les clés sont basées sur les projets.
    // Il faudrait connaître tous les projectId pour lesquels on a mis en cache des exigences.
    console.log('Cache des exigences vidé pour tous les projets (à implémenter)');
  }
};

export { exigencesService };
