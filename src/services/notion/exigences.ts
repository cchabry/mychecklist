/**
 * Service pour la gestion des exigences
 * Adapté pour utiliser le service centralisé
 */

import { notionCentralService } from './notionCentralService';
import { Exigence, ImportanceLevel } from '@/lib/types';
import { operationMode } from '@/services/operationMode';

/**
 * Récupère les exigences d'un projet
 */
export const getProjectExigences = async (projectId: string): Promise<Exigence[]> => {
  if (operationMode.isDemoMode) {
    return getMockExigences(projectId);
  }

  try {
    // Utiliser le service centralisé avec les nouveaux formats de paramètres
    const response = await notionCentralService.get(`/projects/${projectId}/exigences`);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la récupération des exigences du projet ${projectId}:`, error);
    throw error;
  }
};

/**
 * Crée une exigence pour un projet
 */
export const createExigence = async (
  projectId: string, 
  itemId: string, 
  importance: ImportanceLevel, 
  comment?: string
): Promise<Exigence> => {
  if (operationMode.isDemoMode) {
    return createMockExigence(projectId, itemId, importance, comment);
  }

  try {
    const response = await notionCentralService.post(`/projects/${projectId}/exigences`, {
      itemId,
      importance,
      comment
    });
    return response;
  } catch (error) {
    console.error(`Erreur lors de la création d'une exigence pour le projet ${projectId}:`, error);
    throw error;
  }
};

/**
 * Met à jour une exigence
 */
export const updateExigence = async (
  exigenceId: string, 
  importance: ImportanceLevel, 
  comment?: string
): Promise<Exigence> => {
  if (operationMode.isDemoMode) {
    return updateMockExigence(exigenceId, importance, comment);
  }

  try {
    const response = await notionCentralService.patch(`/exigences/${exigenceId}`, {
      importance,
      comment
    });
    return response;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'exigence ${exigenceId}:`, error);
    throw error;
  }
};

/**
 * Supprime une exigence
 */
export const deleteExigence = async (exigenceId: string): Promise<boolean> => {
  if (operationMode.isDemoMode) {
    return deleteMockExigence(exigenceId);
  }

  try {
    await notionCentralService.delete(`/exigences/${exigenceId}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'exigence ${exigenceId}:`, error);
    throw error;
  }
};

// Fonctions mockes pour le mode démo
const getMockExigences = (projectId: string): Exigence[] => {
  // Simuler une liste d'exigences mock pour le projet
  const mockExigences: Exigence[] = [
    {
      id: 'mock-exigence-1',
      projectId: projectId,
      itemId: 'mock-item-1',
      importance: ImportanceLevel.Majeur,
      comment: 'Exigence mock pour le projet ' + projectId
    },
    {
      id: 'mock-exigence-2',
      projectId: projectId,
      itemId: 'mock-item-2',
      importance: ImportanceLevel.Moyen,
      comment: 'Autre exigence mock pour le projet ' + projectId
    }
  ];
  return mockExigences;
};

const createMockExigence = (
  projectId: string,
  itemId: string,
  importance: ImportanceLevel,
  comment?: string
): Exigence => {
  const newMockExigence: Exigence = {
    id: 'mock-new-exigence-' + Date.now(),
    projectId: projectId,
    itemId: itemId,
    importance: importance,
    comment: comment || 'Nouvelle exigence mock'
  };
  console.log('Exigence mock créée:', newMockExigence);
  return newMockExigence;
};

const updateMockExigence = (
  exigenceId: string,
  importance: ImportanceLevel,
  comment?: string
): Exigence => {
  console.log(`Exigence mock ${exigenceId} mise à jour avec importance=${importance}, comment=${comment}`);
  return {
    id: exigenceId,
    projectId: 'mock-project',
    itemId: 'mock-item',
    importance: importance,
    comment: comment || 'Exigence mock mise à jour'
  };
};

const deleteMockExigence = (exigenceId: string): boolean => {
  console.log(`Exigence mock ${exigenceId} supprimée`);
  return true;
};
