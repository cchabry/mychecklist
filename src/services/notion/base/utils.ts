
/**
 * Utilitaires pour les services de base
 */

/**
 * Génère un ID pseudo-aléatoire pour les entités en mode mock
 * 
 * @param prefix - Préfixe pour l'ID (par exemple, le nom de l'entité)
 * @returns Un ID unique
 */
export function generateMockId(prefix: string = 'mock'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Formate une date en chaîne ISO 8601
 * 
 * @param date - Date à formater
 * @returns Chaîne de date au format ISO
 */
export function formatIsoDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Vérifie si une valeur est définie (non null et non undefined)
 * 
 * @param value - Valeur à vérifier
 * @returns true si la valeur est définie
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Vérifie si une chaîne n'est pas vide
 * 
 * @param value - Valeur à vérifier
 * @returns true si la chaîne n'est pas vide
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
