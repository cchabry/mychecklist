
/**
 * Simule une réponse de l'API Notion
 */
export const mockNotionResponse = (endpoint: string, method: string, body?: any) => {
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
  
  if (endpoint.startsWith('/blocks')) {
    return mockNotionBlocks(endpoint, method, body);
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
 * Simulation des réponses Notion API - Pages
 */
const mockNotionPages = (endpoint: string, method: string, body?: any) => {
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

/**
 * Simulation des réponses Notion API - Databases
 */
const mockNotionDatabases = (endpoint: string, method: string, body?: any) => {
  if (method === 'POST' && endpoint === '/databases') {
    console.log('🔄 [MOCK] Simulation de création de base de données');
    
    // Générer un identifiant aléatoire pour la base de données
    const randomId = Math.random().toString(36).substring(2, 15);
    
    // Récupérer les données de la base
    const title = body?.title?.[0]?.text?.content || 'Base sans titre';
    
    // Créer une réponse simulée
    return {
      id: randomId,
      title: [{ plain_text: title }],
      properties: body?.properties || {},
      parent: body?.parent || {},
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      url: `https://notion.so/${randomId}`,
      object: 'database'
    };
  }
  
  if (method === 'GET' && endpoint.match(/^\/databases\/[a-zA-Z0-9-]+$/)) {
    const dbId = endpoint.split('/')[2];
    return {
      object: 'database',
      id: dbId,
      title: [{ plain_text: 'Base de données simulée' }],
      properties: {
        Name: { type: 'title', title: {} },
        Description: { type: 'rich_text', rich_text: {} }
      },
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString()
    };
  }

  if (method === 'POST' && endpoint.match(/^\/databases\/[a-zA-Z0-9-]+\/query$/)) {
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
  
  if (method === 'GET' && endpoint === '/databases') {
    console.log('[MOCK] Retourne la liste des bases de données mock');
    return {
      object: 'list',
      results: [
        {
          object: 'database',
          id: 'database1',
          created_time: '2023-08-01T12:00:00.000Z',
          last_edited_time: '2023-08-01T12:00:00.000Z',
          title: [
            {
              type: 'text',
              text: {
                content: 'Mock Database 1',
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
              plain_text: 'Mock Database 1',
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
        },
        {
          object: 'database',
          id: 'database2',
          created_time: '2023-08-01T12:00:00.000Z',
          last_edited_time: '2023-08-01T12:00:00.000Z',
          title: [
            {
              type: 'text',
              text: {
                content: 'Mock Database 2',
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
              plain_text: 'Mock Database 2',
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
 * Simulation des réponses Notion API - Users
 */
const mockNotionUsers = (endpoint: string, method: string, body?: any) => {
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
 * Simulation des réponses Notion API - Blocks (ajouté pour la v2)
 * Utilisé notamment pour les fichiers joints et contenus riches
 */
const mockNotionBlocks = (endpoint: string, method: string, body?: any) => {
  if (endpoint.startsWith('/blocks/') && method === 'GET') {
    const blockId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne le block mock avec l'ID ${blockId}`);
    
    // Structure de bloc de base
    const mockBlock = {
      object: 'block',
      id: blockId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: '2023-08-01T12:00:00.000Z',
      has_children: false,
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'Contenu de bloc fictif pour la démo',
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
            plain_text: 'Contenu de bloc fictif pour la démo',
            href: null
          }
        ],
        color: 'default'
      }
    };
    
    return mockBlock;
  }
  
  if (endpoint.includes('/children') && method === 'GET') {
    const blockId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne les blocks enfants pour le block ${blockId}`);
    
    // Liste de blocs enfants
    return {
      object: 'list',
      results: [
        {
          object: 'block',
          id: `${blockId}-child1`,
          created_time: '2023-08-01T12:00:00.000Z',
          last_edited_time: '2023-08-01T12:00:00.000Z',
          has_children: false,
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Premier bloc enfant',
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
                plain_text: 'Premier bloc enfant',
                href: null
              }
            ],
            color: 'default'
          }
        },
        {
          object: 'block',
          id: `${blockId}-child2`,
          created_time: '2023-08-01T12:00:00.000Z',
          last_edited_time: '2023-08-01T12:00:00.000Z',
          has_children: false,
          type: 'image',
          image: {
            type: 'external',
            external: {
              url: 'https://placehold.co/600x400'
            }
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  if (endpoint.includes('/children') && method === 'PATCH') {
    const blockId = endpoint.split('/')[2];
    console.log(`[MOCK] Ajoute des blocs enfants au block ${blockId}`);
    
    // Simuler la création de blocs enfants
    return {
      object: 'list',
      results: body.children.map((child: any, index: number) => ({
        object: 'block',
        id: `${blockId}-newchild${index}`,
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString(),
        has_children: false,
        ...child
      }))
    };
  }
  
  if (endpoint.startsWith('/blocks/') && method === 'PATCH') {
    const blockId = endpoint.split('/')[2];
    console.log(`[MOCK] Met à jour le block ${blockId}`);
    
    // Simuler la mise à jour d'un bloc
    return {
      object: 'block',
      id: blockId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: new Date().toISOString(),
      has_children: false,
      ...body
    };
  }
  
  console.warn(`[MOCK] Endpoint Blocks non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Blocks non géré: ${method} ${endpoint}`
  };
};
