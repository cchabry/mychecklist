
import { notionApiRequest } from './proxyFetch';
import { usersApi } from './endpoints/users';
import { databasesApi } from './endpoints/databases';
import { pagesApi } from './endpoints/pages';
import { mockMode } from './mockMode';

// Exporter toutes les API de Notion depuis un point d'entrée unique
export const notionApi = {
  // Point d'accès principal pour les requêtes personnalisées
  request: notionApiRequest,
  
  // Points d'accès organisés par entité
  users: usersApi,
  databases: databasesApi,
  pages: pagesApi,
  
  // Support pour les données de test
  mockMode
};

// Réexporter la fonction principale pour la rétrocompatibilité
export { notionApiRequest };
