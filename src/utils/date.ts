
/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Formate une date ISO en chaîne de caractères lisible
 * 
 * @param dateString Chaîne de date au format ISO ou objet Date
 * @param format Format de sortie (optionnel)
 * @returns Chaîne de date formatée ou chaîne vide si dateString est invalide
 */
export function formatDate(dateString?: string | Date, format?: string): string {
  if (!dateString) {
    return '';
  }
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format par défaut: ISO sans millisecondes ni timezone
    if (!format) {
      return date.toISOString().split('.')[0] + 'Z';
    }
    
    // Formats personnalisés pourront être ajoutés ici
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      default:
        return date.toISOString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}
