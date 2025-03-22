
/**
 * Utilitaires pour la gestion des clés de cache
 */

/**
 * Génère une clé complète avec le préfixe
 */
export function getFullKey(keyPrefix: string, key: string): string {
  return `${keyPrefix}${key}`;
}

/**
 * Récupère la clé originale sans le préfixe
 */
export function getOriginalKey(keyPrefix: string, fullKey: string): string {
  return fullKey.substring(keyPrefix.length);
}
