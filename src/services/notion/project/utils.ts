
/**
 * Utilitaires pour le service de projets
 */

import { Project } from '@/types/domain';

/**
 * Génère un ID mock pour les tests
 */
export function generateMockId(prefix = 'mock'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Génère des projets fictifs pour les tests
 */
export function generateMockProjects(): Project[] {
  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: 'Site vitrine',
      url: 'https://example.com',
      description: 'Site vitrine pour une entreprise de conseil',
      createdAt: '2023-01-15T08:30:00Z',
      updatedAt: '2023-03-22T14:15:00Z',
      status: 'active',
      progress: 75
    },
    {
      id: 'project-2',
      name: 'Boutique en ligne',
      url: 'https://eshop-example.com',
      description: 'Boutique de vente en ligne de produits artisanaux',
      createdAt: '2023-02-10T10:45:00Z',
      updatedAt: '2023-03-20T16:30:00Z',
      status: 'active',
      progress: 60
    },
    {
      id: 'project-3',
      name: 'Application mobile',
      url: 'https://mobile-app.example.com',
      description: 'Application mobile de gestion de tâches',
      createdAt: '2023-03-05T09:20:00Z',
      updatedAt: '2023-03-15T11:10:00Z',
      status: 'pending',
      progress: 30
    },
    {
      id: 'project-4',
      name: 'Plateforme de blog',
      url: 'https://blog-platform.example.com',
      description: 'Plateforme de publication pour blogueurs',
      createdAt: '2022-11-18T13:40:00Z',
      updatedAt: '2023-01-05T09:25:00Z',
      status: 'completed',
      progress: 100
    },
    {
      id: 'project-5',
      name: 'Portail intranet',
      url: 'https://intranet.example.com',
      description: 'Portail intranet pour une entreprise de 200 employés',
      createdAt: '2022-12-20T08:15:00Z',
      updatedAt: '2023-02-28T15:50:00Z',
      status: 'archived',
      progress: 90
    }
  ];

  return mockProjects;
}
