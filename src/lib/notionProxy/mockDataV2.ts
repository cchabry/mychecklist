
/**
 * Simule une réponse de l'API Notion (version v2)
 * Conforme au nouveau modèle de données selon le Brief v2
 */
export const mockNotionResponseV2 = (endpoint: string, method: string, body: any) => {
  console.log(`[MOCK V2] Appel API Notion: ${method} ${endpoint}`);
  
  if (endpoint.startsWith('/users')) {
    return mockNotionUsersV2(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/databases')) {
    return mockNotionDatabasesV2(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/pages')) {
    return mockNotionPagesV2(endpoint, method, body);
  }
  
  console.warn(`[MOCK V2] Endpoint non géré: ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock V2 endpoint non géré: ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Users (version v2)
 */
const mockNotionUsersV2 = (endpoint: string, method: string, body: any) => {
  if (endpoint === '/users' && method === 'GET') {
    console.log('[MOCK V2] Retourne une liste d\'utilisateurs mock');
    return {
      object: 'list',
      results: [
        {
          object: 'user',
          id: 'f7a74990-c99c-479a-a2df-f7a53949940b',
          type: 'person',
          name: 'Mock User V2',
          avatar_url: null,
          person: {
            email: 'mock.user.v2@example.com'
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  if (endpoint === '/users/me' && method === 'GET') {
    console.log('[MOCK V2] Retourne l\'utilisateur courant (mock)');
    return {
      object: 'user',
      id: 'f7a74990-c99c-479a-a2df-f7a53949940b',
      type: 'person',
      name: 'Mock User V2',
      avatar_url: null,
      person: {
        email: 'mock.user.v2@example.com'
      }
    };
  }
  
  console.warn(`[MOCK V2] Endpoint Users non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock V2 endpoint Users non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Databases (version v2)
 */
const mockNotionDatabasesV2 = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/databases/') && method === 'GET') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Retourne la database mock avec l'ID ${databaseId}`);
    return {
      object: 'database',
      id: databaseId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: '2023-08-01T12:00:00.000Z',
      title: [
        {
          type: 'text',
          text: {
            content: 'Mock Database V2',
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
          plain_text: 'Mock Database V2',
          href: null
        }
      ],
      properties: {
        Name: {
          id: 'title',
          name: 'Name',
          type: 'title',
          title: {}
        },
        Status: {
          id: 'status',
          name: 'Status',
          type: 'select',
          select: {
            options: [
              { id: 'opt1', name: 'To Do', color: 'gray' },
              { id: 'opt2', name: 'In Progress', color: 'blue' },
              { id: 'opt3', name: 'Done', color: 'green' }
            ]
          }
        },
        Category: {
          id: 'category',
          name: 'Category',
          type: 'select',
          select: {
            options: [
              { id: 'cat1', name: 'UX/UI', color: 'purple' },
              { id: 'cat2', name: 'SEO', color: 'orange' },
              { id: 'cat3', name: 'Performance', color: 'red' }
            ]
          }
        }
      }
    };
  }
  
  if (endpoint.startsWith('/databases/') && endpoint.endsWith('/query') && method === 'POST') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Retourne les résultats de la query pour la database ${databaseId}`);
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
                    content: 'Mock Project V2',
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
                  plain_text: 'Mock Project V2',
                  href: null
                }
              ]
            },
            Status: {
              id: 'status',
              name: 'Status',
              type: 'select',
              select: {
                id: 'opt2',
                name: 'In Progress',
                color: 'blue'
              }
            },
            Category: {
              id: 'category',
              name: 'Category',
              type: 'select',
              select: {
                id: 'cat1',
                name: 'UX/UI',
                color: 'purple'
              }
            }
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  console.warn(`[MOCK V2] Endpoint Databases non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock V2 endpoint Databases non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Pages (version v2)
 */
const mockNotionPagesV2 = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/pages/') && method === 'GET') {
    const pageId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Retourne la page mock avec l'ID ${pageId}`);
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
                content: 'Mock Page V2',
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
              plain_text: 'Mock Page V2',
              href: null
            }
          ]
        },
        Status: {
          id: 'status',
          name: 'Status',
          type: 'select',
          select: {
            id: 'opt2',
            name: 'In Progress',
            color: 'blue'
          }
        }
      }
    };
  }
  
  if (endpoint.startsWith('/pages') && method === 'POST') {
    console.log(`[MOCK V2] Création d'une nouvelle page`);
    return {
      object: 'page',
      id: 'new-page-' + Math.random().toString(36).substring(2, 10),
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      properties: body.properties
    };
  }
  
  if (endpoint.startsWith('/pages/') && method === 'PATCH') {
    const pageId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Mise à jour de la page mock avec l'ID ${pageId}`);
    return {
      object: 'page',
      id: pageId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: new Date().toISOString(),
      properties: {
        ...body.properties
      }
    };
  }
  
  console.warn(`[MOCK V2] Endpoint Pages non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock V2 endpoint Pages non géré: ${method} ${endpoint}`
  };
};
