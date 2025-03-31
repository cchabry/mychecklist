
/**
 * Service de cache de base
 * Fournit les fonctionnalités essentielles pour stocker et récupérer des données en cache
 */

import { Cache } from './core/baseCache';

// Exporter une instance par défaut
export const cacheService = new Cache({
  debug: process.env.NODE_ENV === 'development'
});

// Réexporter la classe Cache pour l'utilisation externe
export { Cache };
