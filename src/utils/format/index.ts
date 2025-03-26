
/**
 * Utilitaires de formatage de données
 */

/**
 * Tronque un texte à une longueur spécifique
 * @param text - Le texte à tronquer
 * @param maxLength - La longueur maximale souhaitée
 * @param suffix - Le suffixe à ajouter (par défaut "...")
 * @returns Le texte tronqué
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}${suffix}`;
};

/**
 * Formate un nombre en pourcentage
 * @param value - La valeur à formater (0-1)
 * @param decimals - Le nombre de décimales à afficher
 * @returns Le pourcentage formaté
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Met la première lettre d'une chaîne en majuscule
 * @param text - Le texte à capitaliser
 * @returns Le texte avec la première lettre en majuscule
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};
