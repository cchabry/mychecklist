
/**
 * Service de cache de base - point d'entrée
 * Réexporte la classe Cache depuis l'implémentation modulaire
 */

export { Cache } from './implementation/Cache';
export { hasExpired } from './implementation/expiryUtils';
