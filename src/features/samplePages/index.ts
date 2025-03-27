
/**
 * Fonctionnalité SamplePages
 * 
 * Ce module expose les fonctionnalités liées aux pages d'échantillon,
 * qui représentent les pages spécifiques à auditer dans un projet.
 */

// Réexporter les composants, hooks, types et utilitaires
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { samplePagesApi } from '@/services/notion/api/samplePages';
import { SamplePage } from '@/types/domain';

/**
 * Récupère toutes les pages d'échantillon d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Promise résolvant vers un tableau de pages d'échantillon
 * @throws Error si la récupération échoue
 */
export async function getSamplePages(projectId: string): Promise<SamplePage[]> {
  try {
    return await samplePagesApi.getSamplePages(projectId);
  } catch (error) {
    console.error('Erreur lors de la récupération des pages d\'échantillon:', error);
    throw new Error(`Impossible de récupérer les pages d'échantillon: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère une page d'échantillon par son identifiant
 * 
 * @param id - Identifiant unique de la page
 * @returns Promise résolvant vers la page ou null si non trouvée
 * @throws Error si la récupération échoue
 */
export async function getSamplePageById(id: string): Promise<SamplePage | null> {
  try {
    return await samplePagesApi.getSamplePageById(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page d'échantillon ${id}:`, error);
    return null;
  }
}

/**
 * Crée une nouvelle page d'échantillon
 * 
 * @param page - Données de la page à créer (sans l'id)
 * @returns Promise résolvant vers la page créée
 * @throws Error si la création échoue
 */
export async function createSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage> {
  try {
    return await samplePagesApi.createSamplePage(page);
  } catch (error) {
    console.error(`Erreur lors de la création de la page d'échantillon:`, error);
    throw new Error(`Impossible de créer la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une page d'échantillon existante
 * 
 * @param page - Page d'échantillon à mettre à jour
 * @returns Promise résolvant vers la page mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateSamplePage(page: SamplePage): Promise<SamplePage> {
  try {
    return await samplePagesApi.updateSamplePage(page);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la page d'échantillon ${page.id}:`, error);
    throw new Error(`Impossible de mettre à jour la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime une page d'échantillon
 * 
 * @param id - Identifiant unique de la page à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteSamplePage(id: string): Promise<boolean> {
  try {
    return await samplePagesApi.deleteSamplePage(id);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page d'échantillon ${id}:`, error);
    throw new Error(`Impossible de supprimer la page d'échantillon: ${error instanceof Error ? error.message : String(error)}`);
  }
}
