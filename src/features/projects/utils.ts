
/**
 * Utilitaires pour la gestion des projets
 */

import { Project } from '@/types/domain';
import { CreateProjectData, UpdateProjectData, ProjectFilters } from './types';
import { ProjectStatus } from '@/types/enums';

/**
 * Filtre les projets selon les critères spécifiés
 * @param projects Liste des projets à filtrer
 * @param filters Critères de filtrage
 * @returns Liste filtrée de projets
 */
export function filterProjects(projects: Project[], filters: ProjectFilters = {}): Project[] {
  return projects.filter(project => {
    // Filtre par recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = project.name.toLowerCase().includes(searchLower);
      const urlMatch = project.url?.toLowerCase().includes(searchLower) || false;
      const descMatch = project.description?.toLowerCase().includes(searchLower) || false;
      
      if (!(nameMatch || urlMatch || descMatch)) {
        return false;
      }
    }
    
    // Filtre par statut
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(project.status)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Trie les projets selon le critère spécifié
 * @param projects Liste des projets à trier
 * @param sortBy Critère de tri
 * @param sortDirection Direction du tri (asc/desc)
 * @returns Liste triée de projets
 */
export function sortProjects(
  projects: Project[],
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'progress' = 'name',
  sortDirection: 'asc' | 'desc' = 'asc'
): Project[] {
  return [...projects].sort((a, b) => {
    let comparison: number;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'progress':
        comparison = (a.progress || 0) - (b.progress || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

/**
 * Génère des données de test pour les projets
 * @param count Nombre de projets à générer
 * @returns Liste de projets générés
 */
export function generateMockProjects(count: number = 5): Project[] {
  const statuses = Object.values(ProjectStatus);
  const now = new Date().toISOString();
  
  return Array.from({ length: count }, (_, index) => {
    const id = `project-${index + 1}`;
    const status = statuses[index % statuses.length];
    
    return {
      id,
      name: `Projet de test ${index + 1}`,
      url: `https://example.com/projet-${index + 1}`,
      description: `Description du projet de test ${index + 1}`,
      status,
      progress: Math.round(Math.random() * 100),
      createdAt: now,
      updatedAt: now
    };
  });
}
