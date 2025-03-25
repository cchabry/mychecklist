
/**
 * Point d'entrée principal pour le nouveau client Notion
 */

// Exporter les implémentations
import notionClient, { NotionClient } from './NotionClient';
export { notionClient, NotionClient };

// Exporter les types
export * from './types';

// Créer et exporter les services spécifiques
import { createDatabaseService } from './services/databaseService';
import { createPageService } from './services/pageService';
import { createUserService } from './services/userService';
import { createSearchService } from './services/searchService';

// Créer les services avec le client par défaut
export const databaseService = createDatabaseService(notionClient);
export const pageService = createPageService(notionClient);
export const userService = createUserService(notionClient);
export const searchService = createSearchService(notionClient);

// Exporter une interface unifiée pour les services Notion
export const notionService = {
  client: notionClient,
  databases: databaseService,
  pages: pageService,
  users: userService,
  search: searchService
};

// Exporter par défaut
export default notionService;
