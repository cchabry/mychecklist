import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Nettoie l'ID du projet si nécessaire (pour traiter les cas d'IDs sous forme de chaînes JSON)
 */
export const cleanProjectId = (id: string | undefined): string | undefined => {
  if (!id) {
    console.error("cleanProjectId: ID vide ou undefined");
    return undefined;
  }
  
  console.log(`Traitement de l'ID projet original: "${id}"`);
  
  // Si l'ID est une chaîne simple non-JSON, la retourner directement
  if (typeof id === 'string' && !id.startsWith('"')) {
    console.log(`ID projet déjà propre: "${id}"`);
    return id;
  }
  
  // Si l'ID est une chaîne JSON, essayons de l'extraire
  try {
    if (typeof id === 'string' && id.startsWith('"') && id.endsWith('"')) {
      const cleanedId = JSON.parse(id);
      console.log(`ID projet nettoyé de JSON: "${id}" => "${cleanedId}"`);
      return cleanedId;
    }
  } catch (e) {
    console.error(`Erreur lors du nettoyage de l'ID: "${id}"`, e);
  }
  
  return id;
};

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

/**
 * Utilitaire pour combiner des classes CSS avec clsx et tailwind-merge
 * Utilisé par les composants UI
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
