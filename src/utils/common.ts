
/**
 * Utilitaires communs
 */

/**
 * Crée un délai d'attente
 * 
 * @param ms Temps en millisecondes 
 * @returns Promise qui se résout après le délai
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
