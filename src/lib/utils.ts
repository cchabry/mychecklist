
/**
 * Nettoie un ID de projet qui pourrait être entouré de guillemets JSON
 * @param id L'ID à nettoyer
 * @returns L'ID nettoyé
 */
export function cleanProjectId(id: string | undefined): string | undefined {
  if (!id) {
    console.error("cleanProjectId: ID vide ou undefined");
    return undefined;
  }
  
  console.log(`utils.cleanProjectId - ID original: "${id}" (type: ${typeof id})`);
  
  // Si l'ID est déjà une chaîne simple, la retourner
  if (typeof id === 'string' && !id.startsWith('"')) {
    console.log(`utils.cleanProjectId - ID déjà propre: "${id}"`);
    return id;
  }
  
  // Essayer de parser l'ID s'il est entouré de guillemets JSON
  try {
    if (typeof id === 'string' && id.startsWith('"') && id.endsWith('"')) {
      const cleanedId = JSON.parse(id);
      console.log(`utils.cleanProjectId - ID nettoyé de JSON: "${id}" => "${cleanedId}"`);
      return cleanedId;
    }
  } catch (e) {
    console.error(`utils.cleanProjectId - Erreur lors du nettoyage de l'ID: "${id}"`, e);
  }
  
  return id;
}

/**
 * Réinitialise complètement l'état de l'application (cache, mode mock)
 */
export function resetApplicationState(): void {
  // Import dynamique pour éviter les dépendances circulaires
  const { notionApi } = require('./notionProxy');
  
  // Réinitialiser le mode mock
  notionApi.mockMode.forceReset();
  
  // Supprimer les caches
  localStorage.removeItem('projects_cache');
  localStorage.removeItem('audit_cache');
  localStorage.removeItem('notion_mock_mode');
  localStorage.removeItem('notion_last_error');
  
  console.log('État de l\'application réinitialisé complètement');
}
