
/**
 * Utilitaires pour les pages d'échantillon
 * 
 * Ce module fournit des fonctions utilitaires pour la gestion des pages d'échantillon.
 */

import { samplePagesApi } from '@/services/notion/api/samplePages';
import { CreateSamplePageData, SamplePage, UpdateSamplePageData } from './types';

/**
 * Récupère les pages d'échantillon d'un projet
 */
export const getSamplePages = async (projectId: string) => {
  return await samplePagesApi.getSamplePages(projectId);
};

/**
 * Récupère une page d'échantillon par son ID
 */
export const getSamplePageById = async (id: string) => {
  return await samplePagesApi.getSamplePageById(id);
};

/**
 * Crée une nouvelle page d'échantillon
 */
export const createSamplePage = async (data: CreateSamplePageData) => {
  return await samplePagesApi.createSamplePage(data);
};

/**
 * Met à jour une page d'échantillon existante
 */
export const updateSamplePage = async (id: string, data: UpdateSamplePageData) => {
  const currentPage = await getSamplePageById(id);
  return await samplePagesApi.updateSamplePage({
    ...currentPage,
    ...data
  });
};

/**
 * Supprime une page d'échantillon
 */
export const deleteSamplePage = async (id: string) => {
  return await samplePagesApi.deleteSamplePage(id);
};
