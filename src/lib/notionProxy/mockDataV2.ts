
import { 
  ChecklistItem, 
  Project, 
  Audit, 
  ComplianceStatus, 
  ImportanceLevel 
} from '@/lib/types';

/**
 * Simule une réponse de l'API Notion pour la version mockMode v2
 * Cette version est alignée avec le Brief v2 et suit le modèle de données complet
 */
export const mockNotionResponseV2 = (endpoint: string, method: string, body: any) => {
  console.log(`[MOCK V2] Appel API Notion: ${method} ${endpoint}`);
  
  if (endpoint.startsWith('/users')) {
    return mockNotionUsers(endpoint, method, body);
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
    message: `Mock endpoint non géré: ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Users
 */
const mockNotionUsers = (endpoint: string, method: string, body: any) => {
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
    message: `Mock endpoint Users non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Databases v2
 */
const mockNotionDatabasesV2 = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/databases/') && method === 'GET') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Retourne la database mock v2 avec l'ID ${databaseId}`);
    
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
        }
      }
    };
  }
  
  if (endpoint.startsWith('/databases/') && endpoint.endsWith('/query') && method === 'POST') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Retourne les résultats de la query pour la database ${databaseId}`);
    
    // Simuler différents types de bases de données selon l'ID
    if (databaseId.includes('project')) {
      return mockProjectsDatabase(body);
    } else if (databaseId.includes('checklist')) {
      return mockChecklistDatabase(body);
    } else if (databaseId.includes('page')) {
      return mockPagesDatabase(body);
    } else if (databaseId.includes('audit')) {
      return mockAuditsDatabase(body);
    } else if (databaseId.includes('exigence')) {
      return mockExigencesDatabase(body);
    } else if (databaseId.includes('evaluation')) {
      return mockEvaluationsDatabase(body);
    } else if (databaseId.includes('action')) {
      return mockActionsDatabase(body);
    }
    
    // Réponse par défaut
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
    message: `Mock endpoint Databases non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Pages v2
 */
const mockNotionPagesV2 = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/pages/') && method === 'GET') {
    const pageId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Retourne la page mock v2 avec l'ID ${pageId}`);
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
        }
      }
    };
  }
  
  if (endpoint.startsWith('/pages') && method === 'POST') {
    console.log(`[MOCK V2] Crée une nouvelle page mock v2`);
    return {
      object: 'page',
      id: `mock-page-${Date.now()}`,
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      properties: body.properties
    };
  }
  
  if (endpoint.startsWith('/pages/') && method === 'PATCH') {
    const pageId = endpoint.split('/')[2];
    console.log(`[MOCK V2] Met à jour la page mock v2 avec l'ID ${pageId}`);
    return {
      object: 'page',
      id: pageId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: new Date().toISOString(),
      properties: body.properties
    };
  }
  
  console.warn(`[MOCK V2] Endpoint Pages non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Pages non géré: ${method} ${endpoint}`
  };
};

// Fonctions mock pour les différentes bases de données

// Mock de la base de données des projets
const mockProjectsDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'project-1',
        created_time: '2023-10-15T10:30:00Z',
        last_edited_time: '2023-10-20T14:45:00Z',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Site E-commerce' } }]
          },
          URL: {
            id: 'url',
            type: 'url',
            url: 'https://example-ecommerce.com'
          },
          Progress: {
            id: 'progress',
            type: 'number',
            number: 100
          }
        }
      },
      {
        object: 'page',
        id: 'project-2',
        created_time: '2023-09-20T08:15:00Z',
        last_edited_time: '2023-09-25T11:20:00Z',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Site Corporate' } }]
          },
          URL: {
            id: 'url',
            type: 'url',
            url: 'https://example-corporate.com'
          },
          Progress: {
            id: 'progress',
            type: 'number',
            number: 73
          }
        }
      },
      {
        object: 'page',
        id: 'project-3',
        created_time: '2023-11-05T13:45:00Z',
        last_edited_time: '2023-11-05T13:45:00Z',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Application Web' } }]
          },
          URL: {
            id: 'url',
            type: 'url',
            url: 'https://example-webapp.com'
          },
          Progress: {
            id: 'progress',
            type: 'number',
            number: 0
          }
        }
      }
    ],
    next_cursor: null,
    has_more: false
  };
};

// Mock de la base de données checklist
const mockChecklistDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'item-1',
        properties: {
          Consigne: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Images with alternative text' } }]
          },
          Description: {
            id: 'description',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'All images must have appropriate alternative text that describes the content of the image.' } }]
          },
          Category: {
            id: 'category',
            type: 'select',
            select: { name: 'Accessibilité' }
          },
          Subcategory: {
            id: 'subcategory',
            type: 'select',
            select: { name: 'Images' }
          },
          Reference: {
            id: 'reference',
            type: 'multi_select',
            multi_select: [{ name: 'WCAG 1.1.1' }]
          },
          Profil: {
            id: 'profil',
            type: 'multi_select',
            multi_select: [{ name: 'Développeur' }]
          },
          Phase: {
            id: 'phase',
            type: 'multi_select',
            multi_select: [{ name: 'Développement' }]
          },
          Effort: {
            id: 'effort',
            type: 'select',
            select: { name: 'Faible' }
          },
          Priority: {
            id: 'priority',
            type: 'select',
            select: { name: 'Haute' }
          }
        }
      },
      // Ajoutez d'autres exemples d'items de la checklist ici
    ],
    next_cursor: null,
    has_more: false
  };
};

// Mock de la base de données des pages d'échantillon
const mockPagesDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'page-1',
        properties: {
          Title: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Page d\'accueil' } }]
          },
          ProjectId: {
            id: 'projectId',
            type: 'relation',
            relation: [{ id: 'project-1' }]
          },
          URL: {
            id: 'url',
            type: 'url',
            url: 'https://example-ecommerce.com'
          },
          Description: {
            id: 'description',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Page d\'accueil principale' } }]
          },
          Order: {
            id: 'order',
            type: 'number',
            number: 1
          }
        }
      },
      {
        object: 'page',
        id: 'page-2',
        properties: {
          Title: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Fiche produit' } }]
          },
          ProjectId: {
            id: 'projectId',
            type: 'relation',
            relation: [{ id: 'project-1' }]
          },
          URL: {
            id: 'url',
            type: 'url',
            url: 'https://example-ecommerce.com/product/123'
          },
          Description: {
            id: 'description',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Page de détail produit' } }]
          },
          Order: {
            id: 'order',
            type: 'number',
            number: 2
          }
        }
      }
    ],
    next_cursor: null,
    has_more: false
  };
};

// Mock de la base de données des audits
const mockAuditsDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'audit-1',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Audit initial' } }]
          },
          ProjectId: {
            id: 'projectId',
            type: 'relation',
            relation: [{ id: 'project-1' }]
          },
          CreatedAt: {
            id: 'createdAt',
            type: 'date',
            date: { start: '2023-10-18T10:30:00Z' }
          },
          UpdatedAt: {
            id: 'updatedAt',
            type: 'date',
            date: { start: '2023-10-20T14:45:00Z' }
          }
        }
      },
      {
        object: 'page',
        id: 'audit-2',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [{ type: 'text', text: { content: 'Audit de suivi' } }]
          },
          ProjectId: {
            id: 'projectId',
            type: 'relation',
            relation: [{ id: 'project-1' }]
          },
          CreatedAt: {
            id: 'createdAt',
            type: 'date',
            date: { start: '2023-11-15T09:00:00Z' }
          },
          UpdatedAt: {
            id: 'updatedAt',
            type: 'date',
            date: { start: '2023-11-16T16:30:00Z' }
          }
        }
      }
    ],
    next_cursor: null,
    has_more: false
  };
};

// Mock de la base de données des exigences
const mockExigencesDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'exigence-1',
        properties: {
          ProjectId: {
            id: 'projectId',
            type: 'relation',
            relation: [{ id: 'project-1' }]
          },
          ItemId: {
            id: 'itemId',
            type: 'relation',
            relation: [{ id: 'item-1' }]
          },
          Importance: {
            id: 'importance',
            type: 'select',
            select: { name: 'Majeur' }
          },
          Comment: {
            id: 'comment',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Particulièrement important pour ce projet e-commerce avec beaucoup de visuels' } }]
          }
        }
      },
      {
        object: 'page',
        id: 'exigence-2',
        properties: {
          ProjectId: {
            id: 'projectId',
            type: 'relation',
            relation: [{ id: 'project-1' }]
          },
          ItemId: {
            id: 'itemId',
            type: 'relation',
            relation: [{ id: 'item-2' }]
          },
          Importance: {
            id: 'importance',
            type: 'select',
            select: { name: 'Important' }
          },
          Comment: {
            id: 'comment',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'La navigation clavier est essentielle pour l\'accessibilité' } }]
          }
        }
      }
    ],
    next_cursor: null,
    has_more: false
  };
};

// Mock de la base de données des évaluations
const mockEvaluationsDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'evaluation-1',
        properties: {
          AuditId: {
            id: 'auditId',
            type: 'relation',
            relation: [{ id: 'audit-1' }]
          },
          PageId: {
            id: 'pageId',
            type: 'relation',
            relation: [{ id: 'page-1' }]
          },
          ExigenceId: {
            id: 'exigenceId',
            type: 'relation',
            relation: [{ id: 'exigence-1' }]
          },
          Score: {
            id: 'score',
            type: 'select',
            select: { name: 'Partiellement conforme' }
          },
          Comment: {
            id: 'comment',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Certaines images ont des alt texts, mais pas toutes' } }]
          },
          Attachments: {
            id: 'attachments',
            type: 'files',
            files: []
          }
        }
      },
      {
        object: 'page',
        id: 'evaluation-2',
        properties: {
          AuditId: {
            id: 'auditId',
            type: 'relation',
            relation: [{ id: 'audit-1' }]
          },
          PageId: {
            id: 'pageId',
            type: 'relation',
            relation: [{ id: 'page-2' }]
          },
          ExigenceId: {
            id: 'exigenceId',
            type: 'relation',
            relation: [{ id: 'exigence-1' }]
          },
          Score: {
            id: 'score',
            type: 'select',
            select: { name: 'Non conforme' }
          },
          Comment: {
            id: 'comment',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Aucune image n\'a d\'attribut alt' } }]
          },
          Attachments: {
            id: 'attachments',
            type: 'files',
            files: []
          }
        }
      }
    ],
    next_cursor: null,
    has_more: false
  };
};

// Mock de la base de données des actions correctives
const mockActionsDatabase = (body: any) => {
  return {
    object: 'list',
    results: [
      {
        object: 'page',
        id: 'action-1',
        properties: {
          EvaluationId: {
            id: 'evaluationId',
            type: 'relation',
            relation: [{ id: 'evaluation-1' }]
          },
          TargetScore: {
            id: 'targetScore',
            type: 'select',
            select: { name: 'Conforme' }
          },
          Priority: {
            id: 'priority',
            type: 'select',
            select: { name: 'Haute' }
          },
          DueDate: {
            id: 'dueDate',
            type: 'date',
            date: { start: '2023-11-30T00:00:00Z' }
          },
          Responsible: {
            id: 'responsible',
            type: 'people',
            people: [{ id: 'user-1', name: 'John Doe' }]
          },
          Comment: {
            id: 'comment',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Ajouter des attributs alt à toutes les images de la page d\'accueil' } }]
          },
          Status: {
            id: 'status',
            type: 'select',
            select: { name: 'En cours' }
          }
        }
      },
      {
        object: 'page',
        id: 'action-2',
        properties: {
          EvaluationId: {
            id: 'evaluationId',
            type: 'relation',
            relation: [{ id: 'evaluation-2' }]
          },
          TargetScore: {
            id: 'targetScore',
            type: 'select',
            select: { name: 'Conforme' }
          },
          Priority: {
            id: 'priority',
            type: 'select',
            select: { name: 'Critique' }
          },
          DueDate: {
            id: 'dueDate',
            type: 'date',
            date: { start: '2023-11-15T00:00:00Z' }
          },
          Responsible: {
            id: 'responsible',
            type: 'people',
            people: [{ id: 'user-2', name: 'Jane Smith' }]
          },
          Comment: {
            id: 'comment',
            type: 'rich_text',
            rich_text: [{ type: 'text', text: { content: 'Ajouter des attributs alt à toutes les images de la fiche produit' } }]
          },
          Status: {
            id: 'status',
            type: 'select',
            select: { name: 'À faire' }
          }
        }
      }
    ],
    next_cursor: null,
    has_more: false
  };
};

// Exportations pour le mockData v2
export const MOCK_CHECKLIST_ITEMS_V2 = [
  {
    id: "item-1",
    consigne: "Images with alternative text",
    description: "All images must have appropriate alternative text that describes the content of the image.",
    category: "Accessibilité",
    subcategory: "Images",
    reference: ["WCAG 1.1.1"],
    profil: ["Développeur"],
    phase: ["Développement"],
    effort: "Faible",
    priority: "Haute"
  },
  {
    id: "item-2",
    consigne: "Keyboard navigation",
    description: "The website must be fully navigable using only the keyboard.",
    category: "Accessibilité",
    subcategory: "Navigation",
    reference: ["WCAG 2.1.1"],
    profil: ["Développeur"],
    phase: ["Développement"],
    effort: "Moyen",
    priority: "Haute"
  }
  // Ajoutez d'autres items ici
];

// Projets fictifs
export const MOCK_PROJECTS_V2 = [
  {
    id: "project-1",
    name: "Site E-commerce",
    url: "https://example-ecommerce.com",
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-10-20T14:45:00Z",
    progress: 100
  },
  {
    id: "project-2",
    name: "Site Corporate",
    url: "https://example-corporate.com",
    createdAt: "2023-09-20T08:15:00Z",
    updatedAt: "2023-09-25T11:20:00Z",
    progress: 73
  },
  {
    id: "project-3",
    name: "Application Web",
    url: "https://example-webapp.com",
    createdAt: "2023-11-05T13:45:00Z",
    updatedAt: "2023-11-05T13:45:00Z",
    progress: 0
  }
];

// Pages d'échantillon
export const MOCK_PAGES_V2 = [
  {
    id: "page-1",
    projectId: "project-1",
    url: "https://example-ecommerce.com",
    title: "Page d'accueil",
    description: "Page d'accueil principale",
    order: 1
  },
  {
    id: "page-2",
    projectId: "project-1",
    url: "https://example-ecommerce.com/product/123",
    title: "Fiche produit",
    description: "Page de détail produit",
    order: 2
  },
  {
    id: "page-3",
    projectId: "project-1",
    url: "https://example-ecommerce.com/cart",
    title: "Panier",
    description: "Page de panier d'achat",
    order: 3
  }
];

// Exigences de projet
export const MOCK_EXIGENCES_V2 = [
  {
    id: "exigence-1",
    projectId: "project-1",
    itemId: "item-1",
    importance: ImportanceLevel.Majeur,
    comment: "Particulièrement important pour ce projet e-commerce avec beaucoup de visuels"
  },
  {
    id: "exigence-2",
    projectId: "project-1",
    itemId: "item-2",
    importance: ImportanceLevel.Important,
    comment: "La navigation clavier est essentielle pour l'accessibilité"
  }
];

// Audits
export const MOCK_AUDITS_V2 = [
  {
    id: "audit-1",
    projectId: "project-1",
    name: "Audit initial",
    createdAt: "2023-10-18T10:30:00Z",
    updatedAt: "2023-10-20T14:45:00Z"
  },
  {
    id: "audit-2",
    projectId: "project-1",
    name: "Audit de suivi",
    createdAt: "2023-11-15T09:00:00Z",
    updatedAt: "2023-11-16T16:30:00Z"
  }
];

// Évaluations
export const MOCK_EVALUATIONS_V2 = [
  {
    id: "evaluation-1",
    auditId: "audit-1",
    pageId: "page-1",
    exigenceId: "exigence-1",
    score: ComplianceStatus.PartiallyCompliant,
    comment: "Certaines images ont des alt texts, mais pas toutes",
    attachments: []
  },
  {
    id: "evaluation-2",
    auditId: "audit-1",
    pageId: "page-2",
    exigenceId: "exigence-1",
    score: ComplianceStatus.NonCompliant,
    comment: "Aucune image n'a d'attribut alt",
    attachments: []
  }
];

// Actions correctives
export const MOCK_ACTIONS_V2 = [
  {
    id: "action-1",
    evaluationId: "evaluation-1",
    targetScore: ComplianceStatus.Compliant,
    priority: "Haute",
    dueDate: "2023-11-30T00:00:00Z",
    responsible: "John Doe",
    comment: "Ajouter des attributs alt à toutes les images de la page d'accueil",
    status: "En cours"
  },
  {
    id: "action-2",
    evaluationId: "evaluation-2",
    targetScore: ComplianceStatus.Compliant,
    priority: "Critique",
    dueDate: "2023-11-15T00:00:00Z",
    responsible: "Jane Smith",
    comment: "Ajouter des attributs alt à toutes les images de la fiche produit",
    status: "À faire"
  }
];

