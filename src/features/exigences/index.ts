
/**
 * Feature Exigences
 * 
 * Ce module expose les fonctionnalités liées à la gestion des exigences
 * spécifiques à un projet, basées sur les items de la checklist.
 */

// Réexporter les composants, hooks et utilitaires pour faciliter l'accès
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { exigencesApi } from '@/services/notion/api/exigences';
import { 
  Exigence, 
  CreateExigenceData, 
  UpdateExigenceData 
} from './types';

/**
 * Récupère toutes les exigences d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Promise résolvant vers un tableau d'exigences
 * @throws Error si la récupération échoue
 */
export async function getExigences(projectId: string): Promise<Exigence[]> {
  try {
    return await exigencesApi.getExigences(projectId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des exigences:`, error);
    throw new Error(`Impossible de récupérer les exigences: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère une exigence par son identifiant
 * 
 * @param id - Identifiant unique de l'exigence
 * @returns Promise résolvant vers l'exigence ou null si non trouvée
 * @throws Error si la récupération échoue
 */
export async function getExigenceById(id: string): Promise<Exigence | null> {
  try {
    return await exigencesApi.getExigenceById(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'exigence ${id}:`, error);
    return null;
  }
}

/**
 * Crée une nouvelle exigence
 * 
 * @param data - Données de l'exigence à créer
 * @returns Promise résolvant vers l'exigence créée
 * @throws Error si la création échoue
 */
export async function createExigence(data: CreateExigenceData): Promise<Exigence> {
  try {
    // Conversion du type pour l'API
    const exigenceData: Omit<Exigence, 'id'> = {
      projectId: data.projectId,
      itemId: data.itemId,
      importance: data.importance,
      comment: data.comment
    };
    
    return await exigencesApi.createExigence(exigenceData);
  } catch (error) {
    console.error(`Erreur lors de la création de l'exigence:`, error);
    throw new Error(`Impossible de créer l'exigence: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une exigence existante
 * 
 * @param id - Identifiant unique de l'exigence
 * @param data - Données à mettre à jour
 * @returns Promise résolvant vers l'exigence mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateExigence(id: string, data: UpdateExigenceData): Promise<Exigence> {
  try {
    const existingExigence = await exigencesApi.getExigenceById(id);
    if (!existingExigence) {
      throw new Error(`Exigence non trouvée`);
    }
    
    const updatedExigence: Exigence = {
      ...existingExigence,
      ...(data.importance !== undefined && { importance: data.importance }),
      ...(data.comment !== undefined && { comment: data.comment })
    };
    
    return await exigencesApi.updateExigence(updatedExigence);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'exigence ${id}:`, error);
    throw new Error(`Impossible de mettre à jour l'exigence: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime une exigence
 * 
 * @param id - Identifiant unique de l'exigence à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteExigence(id: string): Promise<boolean> {
  try {
    return await exigencesApi.deleteExigence(id);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'exigence ${id}:`, error);
    throw new Error(`Impossible de supprimer l'exigence: ${error instanceof Error ? error.message : String(error)}`);
  }
}
