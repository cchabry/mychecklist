/**
 * Génère des réponses simulées pour l'API Notion conformes au Brief v2
 * @param endpoint - Point de terminaison de l'API
 * @param method - Méthode HTTP (GET, POST, etc.)
 * @param body - Corps de la requête (optionnel)
 * @returns Réponse simulée au format JSON
 */
export const mockNotionResponseV2 = (endpoint: string, method: string, body?: any): any => {
  // Réutiliser la logique de base du mockData original pour le moment
  // mais avec des données conformes au Brief v2
  
  console.log(`📝 [MOCK V2] Requête simulée: ${method} ${endpoint}`);
  
  // /v1/users/me
  if (endpoint.includes('/users/me')) {
    return {
      id: 'mock-user-v2',
      name: 'Utilisateur Mock V2',
      avatar_url: null,
      type: 'person',
      object: 'user'
    };
  }
  
  // /v1/databases/{database_id}
  if (endpoint.match(/\/databases\/[^/]+$/)) {
    return {
      id: endpoint.split('/').pop(),
      title: [{ type: 'text', text: { content: 'Base de données Mock V2', link: null }, plain_text: 'Base de données Mock V2' }],
      properties: {
        Name: { id: 'title', name: 'Name', type: 'title' },
        Status: { id: 'status', name: 'Status', type: 'select' },
        Description: { id: 'desc', name: 'Description', type: 'rich_text' },
        URL: { id: 'url', name: 'URL', type: 'url' },
        Progress: { id: 'prog', name: 'Progress', type: 'number' }
      },
      object: 'database'
    };
  }
  
  // /v1/databases/{database_id}/query
  if (endpoint.includes('/databases/') && endpoint.includes('/query')) {
    return {
      results: [
        {
          id: 'mock-project-1-v2',
          properties: {
            Name: {
              id: 'title',
              type: 'title',
              title: [{ text: { content: 'Projet Mock V2 #1', link: null }, plain_text: 'Projet Mock V2 #1' }]
            },
            Status: { id: 'status', type: 'select', select: { name: 'En cours', color: 'blue' } },
            Description: { id: 'desc', type: 'rich_text', rich_text: [{ text: { content: 'Description du projet mock v2 #1' }, plain_text: 'Description du projet mock v2 #1' }] },
            URL: { id: 'url', type: 'url', url: 'https://exemple-v2.com/projet1' },
            Progress: { id: 'prog', type: 'number', number: 50 }
          },
          url: 'https://notion.so/mock-project-1-v2'
        },
        {
          id: 'mock-project-2-v2',
          properties: {
            Name: {
              id: 'title',
              type: 'title',
              title: [{ text: { content: 'Projet Mock V2 #2', link: null }, plain_text: 'Projet Mock V2 #2' }]
            },
            Status: { id: 'status', type: 'select', select: { name: 'Terminé', color: 'green' } },
            Description: { id: 'desc', type: 'rich_text', rich_text: [{ text: { content: 'Description du projet mock v2 #2' }, plain_text: 'Description du projet mock v2 #2' }] },
            URL: { id: 'url', type: 'url', url: 'https://exemple-v2.com/projet2' },
            Progress: { id: 'prog', type: 'number', number: 100 }
          },
          url: 'https://notion.so/mock-project-2-v2'
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  // /v1/pages
  if (endpoint === '/pages' && method === 'POST') {
    // Créer une nouvelle page
    const pageId = 'mock-page-' + Date.now();
    return {
      id: pageId,
      object: 'page',
      url: 'https://notion.so/' + pageId,
      properties: body?.properties || {}
    };
  }
  
  // /v1/pages/{page_id}
  if (endpoint.match(/\/pages\/[^/]+$/) && method === 'PATCH') {
    // Mettre à jour une page
    return {
      id: endpoint.split('/').pop(),
      object: 'page',
      properties: body?.properties || {}
    };
  }
  
  // Default response
  return {
    object: 'error',
    status: 404,
    message: `[MOCK V2] Endpoint non pris en charge: ${endpoint}`
  };
};
