
import { notionApiRequest } from './proxyFetch';
import * as users from './endpoints/users';
import * as databases from './endpoints/databases';
import * as pages from './endpoints/pages';
import * as projects from './endpoints/projects';
import { mockMode } from './mockMode';

// Exporter toutes les API de Notion depuis un point d'entrée unique
export const notionApi = {
  // Point d'accès principal pour les requêtes personnalisées
  request: notionApiRequest,
  
  // Points d'accès organisés par entité
  users,
  databases,
  pages,
  
  // Support pour les données de test
  mockMode,
  
  // Méthodes de haut niveau pour les projets
  getProjects: projects.getProjects,
  getProject: projects.getProject,
  createProject: projects.createProject,
  updateProject: projects.updateProject,
  getAudit: projects.getAudit
};

// Réexporter la fonction principale pour la rétrocompatibilité
export { notionApiRequest };
