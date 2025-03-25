
// Fonction simple pour journaliser les erreurs
export const logError = (error: any, context: string = 'Erreur Notion'): void => {
  console.error(`❌ ${context}:`, error);
  
  // Stocker les erreurs dans le localStorage pour diagnostic
  try {
    const errorsKey = 'notion_api_errors';
    const storedErrors = localStorage.getItem(errorsKey) || '[]';
    const errors = JSON.parse(storedErrors);
    
    // Ajouter la nouvelle erreur
    errors.push({
      timestamp: Date.now(),
      message: error?.message || String(error),
      context,
      stack: error?.stack
    });
    
    // Limiter le nombre d'erreurs stockées
    if (errors.length > 10) {
      errors.shift(); // Supprimer la plus ancienne erreur
    }
    
    // Sauvegarder
    localStorage.setItem(errorsKey, JSON.stringify(errors));
  } catch (e) {
    console.error('Erreur lors de la journalisation des erreurs:', e);
  }
};

// Fonction pour nettoyer les erreurs Notion stockées
export const clearStoredNotionErrors = (): void => {
  try {
    localStorage.removeItem('notion_api_errors');
    localStorage.removeItem('notion_last_error');
  } catch (e) {
    console.error('Erreur lors du nettoyage des erreurs Notion:', e);
  }
};

// Types pour les erreurs Notion
export enum NotionErrorType {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  PERMISSIONS = 'permissions',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown'
}

// Fonction pour gérer les erreurs Notion
export const handleNotionError = (error: any, context: string = 'Opération Notion'): void => {
  logError(error, context);
  
  // Stocker également la dernière erreur
  try {
    localStorage.setItem('notion_last_error', JSON.stringify({
      timestamp: Date.now(),
      message: error?.message || String(error),
      context
    }));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde de la dernière erreur:', e);
  }
};
