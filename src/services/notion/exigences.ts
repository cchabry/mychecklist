
import { notionApi } from '@/lib/notionProxy';
import { Exigence, ImportanceLevel } from '@/lib/types';
import { notionPropertyExtractors } from '@/lib/notion/notionClient';

// Cache des exigences
let exigencesCache: Record<string, Exigence[]> = {};

/**
 * Service pour la gestion des exigences
 */
export const exigencesService = {
  /**
   * Récupère toutes les exigences pour un projet
   */
  async getExigencesByProject(
    projectId: string,
    forceRefresh = false
  ): Promise<Exigence[]> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    const cacheKey = `project_${projectId}`;
    if (!forceRefresh && exigencesCache[cacheKey]) {
      return exigencesCache[cacheKey];
    }

    // Récupérer la clé API et l'ID de la base de données
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');

    if (!apiKey || !dbId) {
      throw new Error('Configuration Notion manquante');
    }

    try {
      // Filtrer par projectId
      const filter = {
        property: 'projectId',
        rich_text: {
          equals: projectId
        }
      };

      // Requête à l'API Notion
      const response = await notionApi.databases.query(dbId, {
        filter
      }, apiKey);

      // Transformer les résultats en exigences
      const exigences = response.results.map(item => {
        const properties = item.properties;

        // Extraire les propriétés
        return {
          id: item.id,
          projectId: notionPropertyExtractors.getRichTextValue(properties.projectId),
          itemId: notionPropertyExtractors.getRichTextValue(properties.itemId),
          importance: notionPropertyExtractors.getSelectValue(properties.importance) as ImportanceLevel || ImportanceLevel.NA,
          comment: notionPropertyExtractors.getRichTextValue(properties.comment)
        };
      });

      // Mettre en cache
      exigencesCache[cacheKey] = exigences;

      return exigences;
    } catch (error) {
      console.error('Erreur lors de la récupération des exigences:', error);
      throw error;
    }
  },

  /**
   * Crée ou met à jour une exigence
   */
  async saveExigence(exigence: Exigence): Promise<Exigence> {
    // Récupérer la clé API et l'ID de la base de données
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');

    if (!apiKey || !dbId) {
      throw new Error('Configuration Notion manquante');
    }

    try {
      // Préparer les propriétés pour Notion
      const properties = {
        projectId: {
          rich_text: [
            {
              text: {
                content: exigence.projectId
              }
            }
          ]
        },
        itemId: {
          rich_text: [
            {
              text: {
                content: exigence.itemId
              }
            }
          ]
        },
        importance: {
          select: {
            name: exigence.importance
          }
        },
        comment: {
          rich_text: [
            {
              text: {
                content: exigence.comment || ''
              }
            }
          ]
        }
      };

      let result;

      // Créer ou mettre à jour selon qu'on a un ID
      if (exigence.id && exigence.id !== 'new') {
        // Mettre à jour une exigence existante
        result = await notionApi.pages.update(exigence.id, {
          properties
        }, apiKey);
      } else {
        // Créer une nouvelle exigence
        result = await notionApi.pages.create({
          parent: {
            database_id: dbId
          },
          properties
        }, apiKey);
      }

      // Transformer le résultat
      const updatedExigence: Exigence = {
        id: result.id,
        projectId: exigence.projectId,
        itemId: exigence.itemId,
        importance: exigence.importance,
        comment: exigence.comment
      };

      // Mettre à jour le cache
      const cacheKey = `project_${exigence.projectId}`;
      if (exigencesCache[cacheKey]) {
        // Mettre à jour ou ajouter dans le cache
        const index = exigencesCache[cacheKey].findIndex(e => e.id === updatedExigence.id);
        if (index >= 0) {
          exigencesCache[cacheKey][index] = updatedExigence;
        } else {
          exigencesCache[cacheKey].push(updatedExigence);
        }
      }

      return updatedExigence;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'exigence:', error);
      throw error;
    }
  },

  /**
   * Supprime une exigence
   */
  async deleteExigence(exigenceId: string, projectId: string): Promise<boolean> {
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');

    if (!apiKey) {
      throw new Error('Configuration Notion manquante');
    }

    try {
      // Supprimer la page Notion
      await notionApi.pages.update(exigenceId, {
        archived: true
      }, apiKey);

      // Mettre à jour le cache
      const cacheKey = `project_${projectId}`;
      if (exigencesCache[cacheKey]) {
        exigencesCache[cacheKey] = exigencesCache[cacheKey].filter(e => e.id !== exigenceId);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'exigence:', error);
      throw error;
    }
  },

  /**
   * Vide le cache des exigences
   */
  clearCache(): void {
    exigencesCache = {};
  }
};
