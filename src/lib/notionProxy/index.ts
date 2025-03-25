
import { notionApiRequest } from './proxyFetch';
import { mockMode } from './mockMode';
import * as actions from './endpoints/actions';
import * as audits from './endpoints/audits';
import * as checklist from './endpoints/checklist';
import * as databases from './endpoints/databases';
import * as evaluations from './endpoints/evaluations';
import * as exigences from './endpoints/exigences';
import * as pages from './endpoints/pages';
import * as projects from './endpoints/projects';
import * as samplePages from './endpoints/samplePages';
import * as users from './endpoints/users';
import { legacyApiAdapter } from './adapters';

// Créer un API wrapper qui expose toutes les fonctions
export const notionApi = {
  // API de bas niveau
  request: notionApiRequest,
  requestLegacy: legacyApiAdapter,
  
  // Gestionnaire de mode mock
  mockMode,
  
  // Endpoints spécifiques
  actions,
  audits,
  checklist,
  databases,
  evaluations,
  exigences,
  pages,
  projects,
  samplePages,
  users
};

// Compatibilité avec les importations existantes
export { notionApiRequest };
export { mockMode };
export * from './endpoints/actions';
export * from './endpoints/audits';
export * from './endpoints/checklist';
export * from './endpoints/databases';
export * from './endpoints/evaluations';
export * from './endpoints/exigences';
export * from './endpoints/pages';
export * from './endpoints/projects';
export * from './endpoints/samplePages';
export * from './endpoints/users';
