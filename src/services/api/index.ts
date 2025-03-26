
/**
 * Point d'entrée pour tous les services API
 */

import { notionApiImpl } from '../notion/notionApiImpl';

/**
 * API Notion
 */
export const notionApi = notionApiImpl;

/**
 * Exporter tous les services API
 */
export default {
  notionApi
};
