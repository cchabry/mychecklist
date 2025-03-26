
/**
 * Fonctionnalité de gestion des projets
 */

import { Project } from '@/types/domain';

// Données de test pour le développement
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Site E-commerce',
    description: 'Audit d\'accessibilité du site e-commerce',
    url: 'https://example.com/ecommerce',
    progress: 25,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Portail Intranet',
    description: 'Audit complet du portail intranet',
    url: 'https://intranet.example.org',
    progress: 68,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Application Mobile',
    description: 'Audit RGAA de l\'application mobile web',
    url: 'https://mobile.example.net',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Récupère la liste des projets
 * @returns Liste des projets
 */
export const getProjects = async (): Promise<Project[]> => {
  // En production, ceci ferait un appel API
  // Pour le développement, on retourne les données mock
  return Promise.resolve(mockProjects);
};

/**
 * Récupère un projet par son ID
 * @param id - L'ID du projet à récupérer
 * @returns Le projet ou undefined si non trouvé
 */
export const getProjectById = async (id: string): Promise<Project | undefined> => {
  // En production, ceci ferait un appel API
  // Pour le développement, on cherche dans les données mock
  return Promise.resolve(mockProjects.find(project => project.id === id));
};

/**
 * Crée un nouveau projet
 * @param project - Les données du projet à créer
 * @returns Le projet créé
 */
export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
  // En production, ceci ferait un appel API
  // Pour le développement, on simule la création
  const now = new Date().toISOString();
  const newProject: Project = {
    id: `${mockProjects.length + 1}`,
    ...project,
    progress: 0,
    createdAt: now,
    updatedAt: now
  };
  
  mockProjects.push(newProject);
  return Promise.resolve(newProject);
};
