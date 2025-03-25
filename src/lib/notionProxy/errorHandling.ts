
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
