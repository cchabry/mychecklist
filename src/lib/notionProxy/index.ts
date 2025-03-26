
// Importer tous les endpoints de l'API
import * as users from './endpoints/users';
import * as databases from './endpoints/databases';
import * as pages from './endpoints/pages';
import * as projects from './endpoints/projects';
import * as checklist from './endpoints/checklist';
import * as exigences from './endpoints/exigences';
import * as samplePages from './endpoints/samplePages';
import * as audits from './endpoints/audits';
import * as evaluations from './endpoints/evaluations';
import * as actions from './endpoints/actions';

// Importer l'adaptateur mockMode
import mockMode from './mock/mode';

// Importer l'API Proxy
import { proxyFetch, notionApiRequest } from './proxyFetch';

// Créer et exporter l'API Notion avec interface compatible avec le nouvel API
export const notionApi = {
  // Fonction de base pour toutes les requêtes
  request: proxyFetch,
  
  // Endpoints pour les utilisateurs
  users,
  
  // Endpoints pour les bases de données
  databases,
  
  // Endpoints pour les pages
  pages,
  
  // Endpoints spécifiques pour projets et autres
  ...projects,
  ...checklist,
  ...exigences,
  ...samplePages,
  ...audits,
  ...evaluations,
  ...actions,
  
  // Inclure mockMode pour compatibilité avec le code existant
  mockMode,
  
  // Méthode pour récupérer les audits par projet
  getAuditsByProject: audits.getAuditsByProject,
  
  // Méthodes pour projets
  getProject: projects.getProject,
  getProjects: projects.getProjects,
  createProject: projects.createProject,
  updateProject: projects.updateProject,
  deleteProject: projects.deleteProject,
  
  // Méthode pour les pages d'échantillon
  createSamplePage: samplePages.createSamplePage,
  
  // Méthode pour les audits
  getAudit: audits.getAudit,
  
  // Méthodes HTTP standard
  get: <T = any>(endpoint: string, token?: string) => notionApiRequest<T>(endpoint, 'GET', undefined, token),
  post: <T = any>(endpoint: string, body?: any, token?: string) => notionApiRequest<T>(endpoint, 'POST', body, token),
  patch: <T = any>(endpoint: string, body?: any, token?: string) => notionApiRequest<T>(endpoint, 'PATCH', body, token),
  delete: <T = any>(endpoint: string, token?: string) => notionApiRequest<T>(endpoint, 'DELETE', undefined, token),
};

// Exporter par défaut
export default notionApi;
