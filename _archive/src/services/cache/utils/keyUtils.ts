
/**
 * Utilitaires pour la gestion des clés de cache
 */

/**
 * Génère une clé complète avec le préfixe
 */
export function getFullKey(keyPrefix: string, key: string): string {
  return keyPrefix + key;
}

/**
 * Récupère la clé originale sans le préfixe
 */
export function getOriginalKey(keyPrefix: string, fullKey: string): string {
  if (fullKey.startsWith(keyPrefix)) {
    return fullKey.substring(keyPrefix.length);
  }
  return fullKey;
}

/**
 * Génère une clé de cache pour une entité
 */
export function generateEntityKey(entity: string, id: string): string {
  return `${entity}:${id}`;
}

/**
 * Génère une clé de cache pour une liste d'entités
 */
export function generateEntityListKey(entity: string, parameters: Record<string, any> = {}): string {
  // Convertir les paramètres en chaîne de caractères pour la clé
  const paramsStr = Object.keys(parameters).length > 0
    ? `:${Object.entries(parameters)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join('&')}`
    : '';
  
  return `${entity}:list${paramsStr}`;
}

/**
 * Génère une clé de cache pour une relation parent-enfant
 */
export function generateRelationKey(parentEntity: string, parentId: string, childEntity: string): string {
  return `${parentEntity}:${parentId}:${childEntity}`;
}

/**
 * Génère un préfixe pour invalider toutes les clés liées à une entité
 */
export function generateEntityPrefix(entity: string, id?: string): string {
  return id ? `${entity}:${id}` : entity;
}
