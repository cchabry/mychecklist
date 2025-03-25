
/**
 * Adaptateur de compatibilité pour le client Notion
 * Permet d'utiliser le nouveau service centralisé tout en maintenant
 * la compatibilité avec l'ancien client Notion
 */

import { notionApiService } from '../notionApiService';
import { notionCentralService } from '../notionCentralService';

/**
 * Adaptateur qui émule l'ancien client Notion en utilisant
 * le nouveau service centralisé
 */
export const notionClientAdapter = {
  // Compatibilité avec l'ancien client
  isConfigured: () => {
    return !!localStorage.getItem('notion_api_key') && 
           !!localStorage.getItem('notion_database_id');
  },
  
  // Fonctions HTTP de base
  get: async (endpoint: string) => {
    return notionApiService.request(endpoint, 'GET');
  },
  
  post: async (endpoint: string, data: any) => {
    return notionApiService.request(endpoint, 'POST', data);
  },
  
  patch: async (endpoint: string, data: any) => {
    return notionApiService.request(endpoint, 'PATCH', data);
  },
  
  put: async (endpoint: string, data: any) => {
    return notionApiService.request(endpoint, 'PUT', data);
  },
  
  delete: async (endpoint: string) => {
    return notionApiService.request(endpoint, 'DELETE');
  },
  
  // Fonctions spécifiques à Notion
  testConnection: async () => {
    return notionCentralService.testConnection();
  },
  
  // Mode démo pour compatibilité
  mockMode: notionApiService.mockMode,
  
  // Sous-services pour compatibilité
  users: notionApiService.users,
  databases: notionApiService.databases,
  projects: notionApiService.projects,
  exigences: notionApiService.exigences,
  audits: notionApiService.audits
};

export default notionClientAdapter;
