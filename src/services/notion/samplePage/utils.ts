
/**
 * Utilitaires pour le service de pages d'échantillon
 */

import { SamplePage } from '@/types/domain';

/**
 * Génère des pages d'échantillon fictives pour le mode mock
 * 
 * @param projectId - Identifiant du projet
 * @returns Un tableau de pages d'échantillon
 */
export function generateMockSamplePages(projectId: string): SamplePage[] {
  return [
    {
      id: 'page-1',
      projectId,
      url: 'https://example.com',
      title: "Page d'accueil",
      description: "Page principale du site",
      order: 1
    },
    {
      id: 'page-2',
      projectId,
      url: 'https://example.com/about',
      title: "À propos",
      description: "Présentation de l'entreprise",
      order: 2
    },
    {
      id: 'page-3',
      projectId,
      url: 'https://example.com/contact',
      title: "Contact",
      description: "Formulaire de contact",
      order: 3
    }
  ];
}
