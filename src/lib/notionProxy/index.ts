
/**
 * Point d'entrée unifié pour l'API Notion
 * Cette couche gère la compatibilité avec l'ancien système mockMode
 */

import { notionApiService } from '@/services/notion/notionApiService';
import { mockModeAdapter } from './adapters/mockModeAdapter';

/**
 * API Notion avec compatibilité mockMode
 */
export const notionApi = {
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
