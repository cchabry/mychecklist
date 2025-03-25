
import { notionApiRequest } from './proxyFetch';
import { mockMode } from './mockMode';
import { legacyApiAdapter, convertMethodToOptions } from './adapters';
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

// Méthodes de compatibilité pour les projets
const projectsCompat = {
  list: () => legacyApiAdapter('/v1/databases/projects/query', 'POST'),
  retrieve: (id: string) => legacyApiAdapter(`/projects/${id}`, 'GET'),
  create: (data: any) => legacyApiAdapter('/projects', 'POST', data),
  update: (id: string, data: any) => legacyApiAdapter(`/projects/${id}`, 'PATCH', data),
  delete: (id: string) => legacyApiAdapter(`/projects/${id}`, 'DELETE')
};

// Méthodes de compatibilité pour les audits
const auditsCompat = {
  retrieve: (id: string) => legacyApiAdapter(`/audits/${id}`, 'GET'),
  listByProject: (projectId: string) => legacyApiAdapter(`/projects/${projectId}/audits`, 'GET')
};

// Méthodes de compatibilité pour les pages d'échantillon
const samplePagesCompat = {
  create: (data: any) => legacyApiAdapter('/sample-pages', 'POST', data)
};

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
  users,
  
  // Méthodes de compatibilité pour les appellants existants
  getProjects: () => projectsCompat.list(),
  getProject: (id: string) => projectsCompat.retrieve(id),
  createProject: (data: any) => projectsCompat.create(data),
  updateProject: (id: string, data: any) => projectsCompat.update(id, data),
  deleteProject: (id: string) => projectsCompat.delete(id),
  
  getAudit: (id: string) => auditsCompat.retrieve(id),
  getAuditsByProject: (projectId: string) => auditsCompat.listByProject(projectId),
  
  createSamplePage: (data: any) => samplePagesCompat.create(data)
};

// Compatibilité avec les importations existantes
export { notionApiRequest };
export { mockMode };
export { legacyApiAdapter, convertMethodToOptions };

// Exporter les types
export type { ApiRequestContext } from './adapters';

// Exporter de manière explicite pour éviter les ambiguïtés
export { actions };
export { audits };
export { checklist };
export { databases };
export { evaluations };
export { exigences };
export { pages };
export { projects };
export { samplePages };
export { users };
