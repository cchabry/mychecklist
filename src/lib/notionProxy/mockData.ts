
/**
 * Simule une réponse de l'API Notion
 */
export const mockNotionResponse = (endpoint: string, method: string, body: any) => {
  console.log(`[MOCK] Appel API Notion: ${method} ${endpoint}`);
  
  if (endpoint.startsWith('/users')) {
    return mockNotionUsers(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/databases')) {
    return mockNotionDatabases(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/pages')) {
    return mockNotionPages(endpoint, method, body);
  }
  
  console.warn(`[MOCK] Endpoint non géré: ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint non géré: ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Users
 */
const mockNotionUsers = (endpoint: string, method: string, body: any) => {
  if (endpoint === '/users' && method === 'GET') {
    console.log('[MOCK] Retourne une liste d\'utilisateurs mock');
    return {
      object: 'list',
      results: [
        {
          object: 'user',
          id: 'f7a74990-c99c-479a-a2df-f7a53949940b',
          type: 'person',
          name: 'Mock User',
          avatar_url: null,
          person: {
            email: 'mock.user@example.com'
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  if (endpoint === '/users/me' && method === 'GET') {
    console.log('[MOCK] Retourne l\'utilisateur courant (mock)');
    return {
      object: 'user',
      id: 'f7a74990-c99c-479a-a2df-f7a53949940b',
      type: 'person',
      name: 'Mock User',
      avatar_url: null,
      person: {
        email: 'mock.user@example.com'
      }
    };
  }
  
  console.warn(`[MOCK] Endpoint Users non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Users non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Databases
 */
const mockNotionDatabases = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/databases/') && method === 'GET') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne la database mock avec l'ID ${databaseId}`);
    return {
      object: 'database',
      id: databaseId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: '2023-08-01T12:00:00.000Z',
      title: [
        {
          type: 'text',
          text: {
            content: 'Mock Database',
            link: null
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default'
          },
          plain_text: 'Mock Database',
          href: null
        }
      ],
      properties: {
        Name: {
          id: 'title',
          name: 'Name',
          type: 'title',
          title: {}
        }
      }
    };
  }
  
  if (endpoint.startsWith('/databases/') && endpoint.endsWith('/query') && method === 'POST') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne les résultats de la query pour la database ${databaseId}`);
    return {
      object: 'list',
      results: [
        {
          object: 'page',
          id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          created_time: '2023-08-01T12:00:00.000Z',
          last_edited_time: '2023-08-01T12:00:00.000Z',
          properties: {
            Name: {
              id: 'title',
              name: 'Name',
              type: 'title',
              title: [
                {
                  type: 'text',
                  text: {
                    content: 'Mock Page',
                    link: null
                  },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default'
                  },
                  plain_text: 'Mock Page',
                  href: null
                }
              ]
            }
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  console.warn(`[MOCK] Endpoint Databases non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Databases non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Pages
 */
const mockNotionPages = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/pages/') && method === 'GET') {
    const pageId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne la page mock avec l'ID ${pageId}`);
    return {
      object: 'page',
      id: pageId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: '2023-08-01T12:00:00.000Z',
      properties: {
        Name: {
          id: 'title',
          name: 'Name',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Mock Page',
                link: null
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'Mock Page',
              href: null
            }
          ]
        }
      }
    };
  }
  
  console.warn(`[MOCK] Endpoint Pages non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Pages non géré: ${method} ${endpoint}`
  };
};
