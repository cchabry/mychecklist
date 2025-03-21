
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Nettoie l'ID du projet de manière robuste et cohérente
 * - Gère les chaînes JSON (ID entre guillemets)
 * - Gère les cas où l'ID est déjà propre
 * - Gère les cas où l'ID est undefined ou null
 * - Ajoute des logs détaillés pour faciliter le débogage
 */
export const cleanProjectId = (id: string | undefined): string | undefined => {
  console.log(`🧹 cleanProjectId - ID original: "${id}" (type: ${typeof id})`);
  
  // Cas 1: ID manquant
  if (id === undefined || id === null || id === '') {
    console.error("❌ cleanProjectId - ID vide ou undefined");
    return undefined;
  }
  
  try {
    // Cas 2: ID déjà sous forme de chaîne simple
    if (typeof id === 'string') {
      // Vérifier si l'ID est une chaîne JSON (commence et finit par des guillemets)
      if (id.startsWith('"') && id.endsWith('"')) {
        // Extraire le contenu entre guillemets
        const cleanedId = JSON.parse(id);
        console.log(`✅ cleanProjectId - ID nettoyé depuis JSON: "${id}" => "${cleanedId}"`);
        return cleanedId;
      }
      
      // ID déjà propre
      console.log(`✅ cleanProjectId - ID déjà propre: "${id}"`);
      return id;
    }
    
    // Cas 3: ID est un objet ou autre chose
    console.error(`❌ cleanProjectId - Type d'ID non géré: ${typeof id}`);
    // Tenter de convertir en chaîne comme dernier recours
    return String(id);
  } catch (e) {
    console.error(`❌ cleanProjectId - Erreur lors du nettoyage: "${id}"`, e);
    return id; // Retourner l'ID original en cas d'erreur
  }
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
  
  console.log('🔄 État de l\'application réinitialisé complètement');
}

/**
 * Utilitaire pour combiner des classes CSS avec clsx et tailwind-merge
 * Utilisé par les composants UI
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
