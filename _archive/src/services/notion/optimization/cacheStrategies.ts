
/**
 * Stratégies de mise en cache pour Notion
 */

/**
 * Durées de vie par défaut pour différents types de ressources
 */
export const DEFAULT_TTL = {
  // Ressources rarement modifiées
  STATIC: 24 * 60 * 60 * 1000,        // 24 heures
  
  // Ressources modifiées occasionnellement
  USERS: 60 * 60 * 1000,               // 1 heure
  DATABASE_STRUCTURE: 30 * 60 * 1000,  // 30 minutes
  
  // Ressources modifiées fréquemment
  DATABASE_CONTENT: 5 * 60 * 1000,     // 5 minutes
  PAGE_CONTENT: 2 * 60 * 1000,         // 2 minutes
  
  // Ressources très volatiles
  SEARCH_RESULTS: 60 * 1000,           // 1 minute
  
  // Valeur par défaut
  DEFAULT: 5 * 60 * 1000               // 5 minutes
};

/**
 * Détermine le TTL optimisé selon le type de ressource
 */
export function getOptimalTTL(resourceType: string, endpoint: string): number {
  // Analyse de l'endpoint pour déterminer le type de ressource
  if (endpoint.includes('/users')) {
    return DEFAULT_TTL.USERS;
  }
  
  if (endpoint.match(/\/databases\/[^/]+$/)) {
    return DEFAULT_TTL.DATABASE_STRUCTURE;
  }
  
  if (endpoint.match(/\/databases\/[^/]+\/query/)) {
    return DEFAULT_TTL.DATABASE_CONTENT;
  }
  
  if (endpoint.match(/\/pages\/[^/]+$/)) {
    return DEFAULT_TTL.PAGE_CONTENT;
  }
  
  if (endpoint.includes('/search')) {
    return DEFAULT_TTL.SEARCH_RESULTS;
  }
  
  // Par défaut
  return DEFAULT_TTL.DEFAULT;
}

/**
 * Génère une clé de cache optimisée pour une requête Notion
 */
export function generateCacheKey(
  endpoint: string,
  method: string,
  queryParams?: Record<string, any>,
  bodyData?: Record<string, any>
): string {
  // Base: méthode + endpoint
  let key = `${method}:${endpoint}`;
  
  // Ajouter les paramètres de requête s'ils existent
  if (queryParams && Object.keys(queryParams).length > 0) {
    // Trier les clés pour avoir un ordre déterministe
    const sortedParams = Object.keys(queryParams).sort().map(k => {
      return `${k}=${encodeURIComponent(String(queryParams[k]))}`;
    });
    
    key += `?${sortedParams.join('&')}`;
  }
  
  // Pour les requêtes avec body (POST, PATCH, etc.)
  if (bodyData && Object.keys(bodyData).length > 0) {
    // Simplifier le body pour la clé de cache
    // Inclure seulement les champs de filtrage/tri qui affectent le résultat
    const relevantData: Record<string, any> = {};
    
    if (bodyData.filter) relevantData.filter = bodyData.filter;
    if (bodyData.sorts) relevantData.sorts = bodyData.sorts;
    if (bodyData.page_size) relevantData.page_size = bodyData.page_size;
    if (bodyData.start_cursor) relevantData.start_cursor = bodyData.start_cursor;
    
    // Si c'est une recherche, inclure uniquement la requête
    if (endpoint.includes('/search') && bodyData.query) {
      relevantData.query = bodyData.query;
    }
    
    // Ajouter au hachage si des données pertinentes existent
    if (Object.keys(relevantData).length > 0) {
      key += `:${JSON.stringify(relevantData)}`;
    }
  }
  
  return `notion:${key}`;
}

/**
 * Détermine si une requête est cachable
 */
export function isRequestCachable(
  method: string,
  endpoint: string,
  bodyData?: Record<string, any>
): boolean {
  // Seules les méthodes GET et certains POST sont cachables
  if (method === 'GET') {
    return true;
  }
  
  // POST de requête sur les databases sont cachables
  if (method === 'POST' && endpoint.includes('/query')) {
    return true;
  }
  
  // POST de recherche sont cachables
  if (method === 'POST' && endpoint.includes('/search')) {
    return true;
  }
  
  // Les autres méthodes (POST de création, PATCH, DELETE) ne sont pas cachables
  return false;
}

/**
 * Détermine si une requête devrait invalider le cache existant
 */
export function shouldInvalidateCache(
  method: string,
  endpoint: string
): string[] {
  const invalidationPatterns: string[] = [];
  
  // Les méthodes qui modifient des données
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    // Création/Modification de page
    if (endpoint.match(/\/pages(\/[^/]+)?$/)) {
      // Invalider les requêtes de base de données parente
      const matches = endpoint.match(/\/databases\/([^/]+)/);
      if (matches && matches[1]) {
        invalidationPatterns.push(`notion:POST:/databases/${matches[1]}/query`);
      }
      
      // Invalider les recherches
      invalidationPatterns.push('notion:POST:/search');
      
      // Si c'est une modification de page spécifique
      if (endpoint.match(/\/pages\/[^/]+$/)) {
        const pageId = endpoint.split('/').pop();
        invalidationPatterns.push(`notion:GET:/pages/${pageId}`);
      }
    }
    
    // Création/Modification de base de données
    if (endpoint.match(/\/databases(\/[^/]+)?$/)) {
      // Si c'est une modification de DB spécifique
      if (endpoint.match(/\/databases\/[^/]+$/)) {
        const dbId = endpoint.split('/').pop();
        invalidationPatterns.push(`notion:GET:/databases/${dbId}`);
      }
      
      // Invalider les recherches
      invalidationPatterns.push('notion:POST:/search');
    }
  }
  
  return invalidationPatterns;
}
