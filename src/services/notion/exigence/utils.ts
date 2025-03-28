
/**
 * Utilitaires pour le service d'exigences
 */

import { Exigence } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';
import { generateMockId } from '../base';

/**
 * Génère des exigences fictives pour le mode mock
 * 
 * @param projectId - Identifiant du projet
 * @returns Un tableau d'exigences fictives
 */
export function generateMockExigences(projectId: string): Exigence[] {
  return [
    {
      id: 'exig-1',
      projectId,
      itemId: 'check-1',
      importance: ImportanceLevel.Major,
      comment: "Crucial pour l'accessibilité du site"
    },
    {
      id: 'exig-2',
      projectId,
      itemId: 'check-2',
      importance: ImportanceLevel.Medium,
      comment: "Important pour les performances mobiles"
    },
    {
      id: 'exig-3',
      projectId,
      itemId: 'check-3',
      importance: ImportanceLevel.Important,
      comment: "Nécessaire pour le respect des standards RGAA"
    }
  ];
}

