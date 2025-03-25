
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
import { notionApiRequest } from './proxyFetch';

// Créer et exporter l'API Notion
export const notionApi = {
  // Fonction de base pour toutes les requêtes
  request: notionApiRequest,
  
  // Endpoints pour les utilisateurs
  users,
  
  // Endpoints pour les bases de données
  databases,
  
  // Endpoints pour les pages
  pages,
  
  // Endpoints pour les projets
  ...projects,
  
  // Endpoints pour les checklists
  ...checklist,
  
  // Endpoints pour les exigences
  ...exigences,
  
  // Endpoints pour les pages d'échantillon
  ...samplePages,
  
  // Endpoints pour les audits
  ...audits,
  
  // Endpoints pour les évaluations
  ...evaluations,
  
  // Endpoints pour les actions correctives
  ...actions,
  
  // Système de mode mock (pour compatibilité)
  mockMode,
  
  // Méthode pour récupérer les audits par projet
  getAuditsByProject: audits.getAuditsByProject
};

// Exporter par défaut
export default notionApi;
