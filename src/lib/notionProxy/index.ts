
/**
 * Point d'entrée unifié pour l'API Notion
 * Cette couche gère la compatibilité avec l'ancien système mockMode
 */

import { notionApiService } from '@/services/notion/notionApiService';
import { mockModeAdapter } from './adapters/mockModeAdapter';
import { NotionApiResponse } from '@/services/notion/types/unified';

/**
 * Interface typée pour l'API Notion
 */
export interface NotionProxyApi {
  request: (endpoint: string, method?: string, body?: any, token?: string) => Promise<NotionApiResponse<any>>;
  testConnection: (token?: string) => Promise<{ success: boolean; user?: string; error?: string }>;
  projects: typeof notionApiService.projects;
  audits: typeof notionApiService.audits;
  exigences: typeof notionApiService.exigences;
  users: typeof notionApiService.users;
  databases: typeof notionApiService.databases;
  pages: typeof notionApiService.pages;
  getProject: typeof notionApiService.getProject;
  getProjects: typeof notionApiService.getProjects;
  getAudit: typeof notionApiService.getAudit;
  getAuditsByProject: typeof notionApiService.getAuditsByProject;
  createSamplePage: typeof notionApiService.createSamplePage;
  mockMode: typeof mockModeAdapter;
}

/**
 * API Notion avec compatibilité mockMode
 */
export const notionApi: NotionProxyApi = {
  /**
   * Méthode principale pour faire des requêtes
   */
  request: (endpoint: string, method = 'GET', body?: any, token?: string) => {
    return notionApiService.request(endpoint, method, body, token);
  },
  
  /**
   * Tester la connexion à l'API Notion
   */
  testConnection: (token?: string) => {
    return notionApiService.testConnection(token);
  },
  
  /**
   * API pour les projets
   */
  projects: notionApiService.projects,
  
  /**
   * API pour les audits
   */
  audits: notionApiService.audits,
  
  /**
   * API pour les exigences
   */
  exigences: notionApiService.exigences,
  
  /**
   * API pour les utilisateurs
   */
  users: notionApiService.users,
  
  /**
   * API pour les bases de données
   */
  databases: notionApiService.databases,
  
  /**
   * API pour les pages
   */
  pages: notionApiService.pages,
  
  /**
   * Méthodes de compatibilité
   */
  getProject: notionApiService.getProject,
  getProjects: notionApiService.getProjects,
  getAudit: notionApiService.getAudit,
  getAuditsByProject: notionApiService.getAuditsByProject,
  createSamplePage: notionApiService.createSamplePage,
  
  /**
   * Mode mock pour compatibilité avec l'ancien système
   */
  mockMode: mockModeAdapter
};

export default notionApi;
