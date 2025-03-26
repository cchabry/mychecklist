
/**
 * Point d'entrée pour le client Notion
 * Exporte le client et les services spécialisés
 */

// Exporter les types
export * from './types';
export * from './legacy';

// Exporter les clients et services
export { default as notionClient } from './NotionClient';
export { NotionClient } from './NotionClient';

// Créer et exporter les services spécialisés
import { createNotionService } from './service';
export const notionService = createNotionService();

// Exporter par défaut
export default notionService;
