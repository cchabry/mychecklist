
import { notionApiRequest } from './proxyFetch';
import * as users from './endpoints/users';
import * as databases from './endpoints/databases';
import * as pages from './endpoints/pages';
import { mockMode } from './mockMode';
import { mockModeV2 } from './mockModeV2';

/**
 * Vérifie si le mode mock v2 est actif et devrait être utilisé
 * au lieu du mockMode original
 */
const shouldUseMockModeV2 = () => {
  return mockModeV2.isActive();
};

/**
 * Configuration pour déterminer quelle implémentation utiliser
 */
export const mockConfig = {
  useV2: shouldUseMockModeV2,
  // Pour permettre de forcer à utiliser v1 même si v2 est activé
  forceV1: false
};

// Exporter toutes les API de Notion depuis un point d'entrée unique
export const notionApi = {
  // Point d'accès principal pour les requêtes personnalisées
  request: notionApiRequest,
  
  // Points d'accès organisés par entité
  users,
  databases,
  pages,
  
  // Support pour les données de test
  mockMode,
  
  // Nouvelle version du mockMode (Brief v2)
  mockModeV2,
  
  // Configuration pour choisir la version
  mockConfig
};

// Réexporter la fonction principale pour la rétrocompatibilité
export { notionApiRequest };
