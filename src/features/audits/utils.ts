
/**
 * Utilitaires spécifiques aux audits
 * 
 * Ce fichier contient des fonctions utilitaires pour la fonctionnalité de gestion des audits
 */

import { Audit } from './types';

/**
 * Calcule le pourcentage de progression d'un audit basé sur ses évaluations
 * 
 * @param audit - L'audit pour lequel calculer la progression
 * @returns Le pourcentage de progression (0-100)
 */
export function calculateAuditProgress(audit: Audit): number {
  // Pour l'instant, retourne simplement la progression stockée ou 0
  return audit.progress || 0;
}

/**
 * Détermine si un audit est considéré comme récent (moins de 7 jours)
 * 
 * @param audit - L'audit à vérifier
 * @returns true si l'audit est récent, false sinon
 */
export function isRecentAudit(audit: Audit): boolean {
  const createdAt = new Date(audit.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
}
