
import { notionApiRequest } from './proxyFetch';
import * as users from './endpoints/users';
import * as databases from './endpoints/databases';
import * as pages from './endpoints/pages';
import { mockMode } from './mockMode';

// Exporter toutes les API de Notion depuis un point d'entrée unique
export const notionApi = {
  // Point d'accès principal pour les requêtes personnalisées
  request: notionApiRequest,
  
  // Points d'accès organisés par entité
  users,
  databases,
  pages,
  
  // Support pour les données de test
  mockMode
};

// Réexporter la fonction principale pour la rétrocompatibilité
export { notionApiRequest };
