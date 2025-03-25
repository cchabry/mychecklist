
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
  getProjects: () => projects.list(),
  getProject: (id: string) => projects.retrieve(id),
  createProject: (data: any) => projects.create(data),
  updateProject: (id: string, data: any) => projects.update(id, data),
  deleteProject: (id: string) => projects.delete(id),
  
  getAudit: (id: string) => audits.retrieve(id),
  getAuditsByProject: (projectId: string) => audits.listByProject(projectId),
  
  createSamplePage: (data: any) => samplePages.create(data)
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
