
/**
 * Point d'entrée pour les clients API Notion
 * 
 * Ce module centralise l'accès aux différents clients API Notion (http, mock, etc.)
 * et exporte l'interface unifiée.
 */

// Exporter le client Notion principal
export { notionClient } from './notionClient';

// Exporter les clients spécialisés pour un accès direct si nécessaire
export { notionHttpClient } from './notionHttpClient';
export { notionMockClient } from './mock/notionMockClient';

// Exporter le testeur de connexion
export { testConnection } from './connectionTester';

// Exporter le gestionnaire d'erreurs
export { handleNotionError } from './errorHandler';

// Exporter les générateurs de données mock
export { mockDataGenerator } from './mock/mockDataGenerators';
