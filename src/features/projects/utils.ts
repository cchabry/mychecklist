
/**
 * Utilitaires spécifiques aux projets
 * 
 * Ce fichier contient des fonctions utilitaires pour la fonctionnalité de gestion des projets
 */

import { Project } from './types';

/**
 * Calcule le pourcentage de progression d'un projet basé sur ses audits
 * 
 * @param project - Le projet pour lequel calculer la progression
 * @returns Le pourcentage de progression (0-100)
 */
export function calculateProjectProgress(project: Project): number {
  // Pour l'instant, retourne simplement la progression stockée ou 0
  return project.progress || 0;
}

/**
 * Formate l'URL d'un projet pour l'affichage
 * 
 * @param url - L'URL du projet
 * @returns L'URL formatée sans le protocole
 */
export function formatProjectUrl(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
