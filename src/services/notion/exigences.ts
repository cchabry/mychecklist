
import { notionApi } from '@/lib/notionProxy';
import { ExigenceData, CreateExigenceParams, UpdateExigenceParams } from './types/exigences';
import { NotionRequestOptions } from './types';

/**
 * Récupère toutes les exigences pour un projet spécifique
 * @param projectId Identifiant du projet
 * @returns Liste des exigences
 */
export async function getExigencesForProject(projectId: string): Promise<ExigenceData[]> {
  try {
    // Adaptation pour utiliser la nouvelle interface
    const options: NotionRequestOptions = {
      endpoint: `/projects/${projectId}/exigences`,
      method: 'GET'
    };
    
    const response = await notionApi.request<ExigenceData[]>(options);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des exigences:', error);
    throw error;
  }
}

/**
 * Récupère une exigence spécifique par son ID
 * @param exigenceId Identifiant de l'exigence
 * @returns Données de l'exigence
 */
export async function getExigence(exigenceId: string): Promise<ExigenceData> {
  try {
    // Adaptation pour utiliser la nouvelle interface
    const options: NotionRequestOptions = {
      endpoint: `/exigences/${exigenceId}`,
      method: 'GET'
    };
    
    const response = await notionApi.request<ExigenceData>(options);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'exigence:', error);
    throw error;
  }
}

/**
 * Crée une nouvelle exigence pour un projet
 * @param params Paramètres de création de l'exigence
 * @returns Données de l'exigence créée
 */
export async function createExigence(params: CreateExigenceParams): Promise<ExigenceData> {
  try {
    // Adaptation pour utiliser la nouvelle interface
    const options: NotionRequestOptions = {
      endpoint: '/exigences',
      method: 'POST',
      body: params
    };
    
    const response = await notionApi.request<ExigenceData>(options);
    return response;
  } catch (error) {
    console.error('Erreur lors de la création de l\'exigence:', error);
    throw error;
  }
}

/**
 * Met à jour une exigence existante
 * @param exigenceId Identifiant de l'exigence à mettre à jour
 * @param params Paramètres de mise à jour
 * @returns Données de l'exigence mise à jour
 */
export async function updateExigence(exigenceId: string, params: UpdateExigenceParams): Promise<ExigenceData> {
  try {
    // Adaptation pour utiliser la nouvelle interface
    const options: NotionRequestOptions = {
      endpoint: `/exigences/${exigenceId}`,
      method: 'PATCH',
      body: params
    };
    
    const response = await notionApi.request<ExigenceData>(options);
    return response;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'exigence:', error);
    throw error;
  }
}

/**
 * Supprime une exigence
 * @param exigenceId Identifiant de l'exigence à supprimer
 * @returns Statut de la suppression
 */
export async function deleteExigence(exigenceId: string): Promise<{ success: boolean }> {
  try {
    // Adaptation pour utiliser la nouvelle interface
    const options: NotionRequestOptions = {
      endpoint: `/exigences/${exigenceId}`,
      method: 'DELETE'
    };
    
    const response = await notionApi.request<{ success: boolean }>(options);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'exigence:', error);
    throw error;
  }
}
