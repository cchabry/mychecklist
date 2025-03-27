
/**
 * Constantes pour la feature SamplePages
 */

/**
 * Validation des URLs
 */
export const URL_REGEX = /^(http|https):\/\/[^ "]+$/;

/**
 * Messages d'erreur pour la validation
 */
export const ERROR_MESSAGES = {
  INVALID_URL: 'L\'URL doit être une URL valide (commençant par http:// ou https://)',
  EMPTY_TITLE: 'Le titre est requis',
  DUPLICATE_URL: 'Cette URL est déjà présente dans l\'échantillon'
};

/**
 * Nombre maximum de pages recommandé pour un échantillon
 */
export const MAX_RECOMMENDED_PAGES = 15;
