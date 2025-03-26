
/**
 * Utilitaires de validation de données
 */

/**
 * Vérifie si une chaîne est une URL valide
 * @param url - L'URL à valider
 * @returns Booléen indiquant si l'URL est valide
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Vérifie si une chaîne est vide ou ne contient que des espaces
 * @param str - La chaîne à vérifier
 * @returns Booléen indiquant si la chaîne est vide
 */
export const isEmpty = (str: string): boolean => {
  return str.trim() === '';
};

/**
 * Vérifie si une chaîne a une longueur minimale
 * @param str - La chaîne à vérifier
 * @param minLength - La longueur minimale requise
 * @returns Booléen indiquant si la chaîne a la longueur minimale
 */
export const hasMinLength = (str: string, minLength: number): boolean => {
  return str.trim().length >= minLength;
};

/**
 * Vérifie si une valeur est définie (non null et non undefined)
 * @param value - La valeur à vérifier
 * @returns Booléen indiquant si la valeur est définie
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};
