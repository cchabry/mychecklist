
/**
 * Service centralisé pour tous les appels à l'API Notion
 * Ce service est le SEUL point d'entrée autorisé pour communiquer avec l'API Notion
 */

import { toast } from 'sonner';

/**
 * URL base de la fonction Netlify servant de proxy pour l'API Notion
 */
const NETLIFY_PROXY_URL = '/.netlify/functions/notion-proxy';

/**
 * Options pour les requêtes à l'API Notion
 */
export interface NotionRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string;
  showErrorToast?: boolean;
}

/**
 * Extrait un jeton Notion depuis le stockage local
 */
const getStoredToken = (): string | null => {
  return localStorage.getItem('notion_api_key');
};

/**
 * Effectue une requête à l'API Notion via le proxy Netlify
 * C'est la SEULE fonction qui doit être utilisée pour communiquer avec l'API Notion
 */
export async function notionRequest<T = any>(options: NotionRequestOptions): Promise<T> {
  const { endpoint, method = 'GET', body, token, showErrorToast = true } = options;
  
  // Récupérer le token depuis le localStorage si non fourni
  const authToken = token || getStoredToken();
  
  if (!authToken) {
    const error = new Error('Token d\'authentification Notion manquant');
    if (showErrorToast) {
      toast.error('Erreur d\'authentification Notion', {
        description: 'Token d\'accès manquant. Veuillez configurer votre API Notion.'
      });
    }
    throw error;
  }
  
  try {
    // Déterminer l'endpoint correct pour l'API Notion
    // Les endpoints personnalisés comme /projects doivent être mappés aux endpoints réels de l'API Notion
    let notionEndpoint = endpoint;
    let finalBody = body;
    
    // Mapper les endpoints personnalisés aux endpoints réels de l'API Notion
    if (endpoint.startsWith('/projects')) {
      // Pour les requêtes de projets, on utilise une requête à la base de données Notion
      if (endpoint === '/projects') {
        notionEndpoint = '/databases/YOUR_DATABASE_ID/query';
        finalBody = { 
          filter: { 
            property: 'Type', 
            select: { equals: 'Project' } 
          } 
        };
      } else {
        // Pour un projet spécifique, extrayez l'ID et utilisez l'endpoint de page
        const projectId = endpoint.split('/')[2];
        if (projectId) {
          // Si c'est un endpoint comme /projects/{id}/exigences
          if (endpoint.includes('/exigences')) {
            notionEndpoint = `/databases/YOUR_EXIGENCES_DB_ID/query`;
            finalBody = { 
              filter: { 
                property: 'ProjectId', 
                relation: { contains: projectId } 
              } 
            };
          } else {
            // Sinon c'est juste pour obtenir un projet
            notionEndpoint = `/pages/${projectId}`;
          }
        }
      }
    }
    
    console.log(`🔐 Requête Notion via proxy Netlify: ${method} ${notionEndpoint}`);
    
    // Utiliser EXCLUSIVEMENT la fonction Netlify
    const response = await fetch(NETLIFY_PROXY_URL, {
      method: 'POST', // Toujours POST pour la fonction Netlify
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest' // Pour identifier les requêtes AJAX
      },
      body: JSON.stringify({
        endpoint: notionEndpoint,
        method,
        body: finalBody,
        token: authToken
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      const errorMessage = `Erreur ${response.status}: ${errorData}`;
      console.error(`❌ Échec de la requête Notion: ${errorMessage}`);
      
      if (showErrorToast) {
        toast.error('Erreur lors de la requête Notion', {
          description: `Statut: ${response.status}. Vérifiez les logs pour plus de détails.`
        });
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`✅ Réponse reçue pour ${method} ${notionEndpoint}`);
    return data as T;
  } catch (error) {
    console.error(`❌ Erreur lors de l'appel au proxy Netlify:`, error);
    
    if (showErrorToast) {
      toast.error('Erreur de communication avec l\'API Notion', {
        description: error instanceof Error ? error.message : String(error)
      });
    }
    
    throw error;
  }
}

/**
 * Service centralisé pour l'API Notion
 * Exposant des méthodes pour chaque endpoint de l'API
 */
export const notionCentralService = {
  // Méthodes de base par type de requête
  get: <T = any>(endpoint: string, token?: string) => 
    notionRequest<T>({ endpoint, method: 'GET', token }),
  
  post: <T = any>(endpoint: string, body?: any, token?: string) => 
    notionRequest<T>({ endpoint, method: 'POST', body, token }),
  
  patch: <T = any>(endpoint: string, body?: any, token?: string) => 
    notionRequest<T>({ endpoint, method: 'PATCH', body, token }),
  
  delete: <T = any>(endpoint: string, token?: string) => 
    notionRequest<T>({ endpoint, method: 'DELETE', token }),
  
  // API Utilisateurs
  users: {
    me: (token?: string) => notionRequest({ 
      endpoint: '/users/me', 
      method: 'GET', 
      token 
    }),
    
    list: (token?: string) => notionRequest({ 
      endpoint: '/users', 
      method: 'GET', 
      token 
    })
  },
  
  // API Bases de données
  databases: {
    retrieve: (databaseId: string, token?: string) => notionRequest({ 
      endpoint: `/databases/${databaseId}`, 
      method: 'GET', 
      token 
    }),
    
    query: (databaseId: string, query: any = {}, token?: string) => notionRequest({ 
      endpoint: `/databases/${databaseId}/query`, 
      method: 'POST', 
      body: query,
      token 
    }),
    
    list: (token?: string) => notionRequest({ 
      endpoint: '/search', 
      method: 'POST', 
      body: {
        filter: {
          value: 'database',
          property: 'object'
        }
      },
      token 
    }),
    
    create: (pageId: string, data: any, token?: string) => notionRequest({ 
      endpoint: '/databases', 
      method: 'POST', 
      body: {
        parent: { page_id: pageId },
        ...data
      },
      token 
    })
  },
  
  // API Pages
  pages: {
    retrieve: (pageId: string, token?: string) => notionRequest({ 
      endpoint: `/pages/${pageId}`, 
      method: 'GET', 
      token 
    }),
    
    create: (data: any, token?: string) => notionRequest({ 
      endpoint: '/pages', 
      method: 'POST', 
      body: data,
      token 
    }),
    
    update: (pageId: string, data: any, token?: string) => notionRequest({ 
      endpoint: `/pages/${pageId}`, 
      method: 'PATCH', 
      body: data,
      token 
    }),
    
    // Alias pour la cohérence avec l'API Notion
    createPage: (data: any, token?: string) => notionRequest({ 
      endpoint: '/pages', 
      method: 'POST', 
      body: data,
      token 
    }),
    
    updatePage: (pageId: string, data: any, token?: string) => notionRequest({ 
      endpoint: `/pages/${pageId}`, 
      method: 'PATCH', 
      body: data,
      token 
    })
  },
  
  // API pour les projets, checklists, exigences, etc.
  projects: {
    getAll: async (token?: string) => {
      try {
        // En mode démo, nous devrions retourner des données simulées
        if (window.localStorage.getItem('operation_mode') === 'demo') {
          console.log('Mode démo activé pour projects.getAll');
          return [
            { id: 'demo-project-1', name: 'Projet Démo 1', url: 'https://example.com/demo1' },
            { id: 'demo-project-2', name: 'Projet Démo 2', url: 'https://example.com/demo2' }
          ];
        }
        
        // Utilisez l'API de base de données Notion pour obtenir les projets
        const response = await notionRequest({
          endpoint: '/databases/YOUR_DATABASE_ID/query',
          method: 'POST',
          body: {
            filter: {
              property: 'Type',
              select: { equals: 'Project' }
            }
          },
          token
        });
        
        // Transformez la réponse Notion en format projet
        // Note: Ceci est un exemple, ajustez selon votre structure réelle de données
        return response.results.map(item => ({
          id: item.id,
          name: item.properties.Name?.title?.[0]?.plain_text || 'Sans nom',
          url: item.properties.URL?.url || '',
          // Ajoutez d'autres propriétés selon vos besoins
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        // En cas d'erreur, retourner un tableau vide ou des données de démo
        return [];
      }
    },
    
    getById: async (projectId: string, token?: string) => {
      try {
        // En mode démo, retourner un projet simulé
        if (window.localStorage.getItem('operation_mode') === 'demo') {
          console.log(`Mode démo activé pour projects.getById(${projectId})`);
          return {
            id: projectId,
            name: `Projet Démo ${projectId}`,
            url: `https://example.com/demo/${projectId}`,
            description: 'Ceci est un projet de démonstration'
          };
        }
        
        // Utilisez l'API Pages de Notion pour obtenir un projet spécifique
        const response = await notionRequest({
          endpoint: `/pages/${projectId}`,
          method: 'GET',
          token
        });
        
        // Transformez la réponse Notion en format projet
        return {
          id: response.id,
          name: response.properties.Name?.title?.[0]?.plain_text || 'Sans nom',
          url: response.properties.URL?.url || '',
          description: response.properties.Description?.rich_text?.[0]?.plain_text || '',
          // Ajoutez d'autres propriétés selon vos besoins
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération du projet ${projectId}:`, error);
        // En cas d'erreur, retourner null ou un projet de démo
        return null;
      }
    },
    
    create: async (data: any, token?: string) => {
      // En mode démo, simuler la création d'un projet
      if (window.localStorage.getItem('operation_mode') === 'demo') {
        console.log('Mode démo activé pour projects.create', data);
        return {
          id: 'new-demo-project-' + Date.now(),
          ...data,
          createdAt: new Date().toISOString()
        };
      }
      
      // Créer un projet réel dans Notion
      return await notionRequest({
        endpoint: '/pages',
        method: 'POST',
        body: {
          parent: { database_id: 'YOUR_DATABASE_ID' },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: data.name || 'Nouveau projet'
                  }
                }
              ]
            },
            URL: {
              url: data.url || ''
            },
            Type: {
              select: {
                name: 'Project'
              }
            },
            // Ajoutez d'autres propriétés selon vos besoins
          }
        },
        token
      });
    },
    
    update: async (projectId: string, data: any, token?: string) => {
      // En mode démo, simuler la mise à jour d'un projet
      if (window.localStorage.getItem('operation_mode') === 'demo') {
        console.log(`Mode démo activé pour projects.update(${projectId})`, data);
        return {
          id: projectId,
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Mettre à jour un projet réel dans Notion
      return await notionRequest({
        endpoint: `/pages/${projectId}`,
        method: 'PATCH',
        body: {
          properties: {
            Name: data.name ? {
              title: [
                {
                  text: {
                    content: data.name
                  }
                }
              ]
            } : undefined,
            URL: data.url ? {
              url: data.url
            } : undefined,
            // Ajoutez d'autres propriétés selon vos besoins
          }
        },
        token
      });
    },
    
    delete: async (projectId: string, token?: string) => {
      // En mode démo, simuler la suppression d'un projet
      if (window.localStorage.getItem('operation_mode') === 'demo') {
        console.log(`Mode démo activé pour projects.delete(${projectId})`);
        return true;
      }
      
      // Mettre à jour le projet pour le marquer comme archivé dans Notion
      try {
        await notionRequest({
          endpoint: `/pages/${projectId}`,
          method: 'PATCH',
          body: {
            archived: true
          },
          token
        });
        return true;
      } catch (error) {
        console.error(`Erreur lors de la suppression du projet ${projectId}:`, error);
        throw error;
      }
    }
  },
  
  // Méthodes pour les audits
  audits: {
    getById: async (auditId: string, token?: string) => {
      return await notionRequest({
        endpoint: `/audits/${auditId}`,
        method: 'GET',
        token
      });
    },
    
    getByProject: async (projectId: string, token?: string) => {
      return await notionRequest({
        endpoint: `/projects/${projectId}/audits`,
        method: 'GET',
        token
      });
    },
    
    create: async (data: any, token?: string) => {
      return await notionRequest({
        endpoint: '/audits',
        method: 'POST',
        body: data,
        token
      });
    },
    
    update: async (auditId: string, data: any, token?: string) => {
      return await notionRequest({
        endpoint: `/audits/${auditId}`,
        method: 'PATCH',
        body: data,
        token
      });
    }
  },
  
  // Méthodes pour les pages d'échantillon
  samplePages: {
    create: async (data: any, token?: string) => {
      return await notionRequest({
        endpoint: '/sample-pages',
        method: 'POST',
        body: data,
        token
      });
    },
    
    getByProject: async (projectId: string, token?: string) => {
      return await notionRequest({
        endpoint: `/projects/${projectId}/sample-pages`,
        method: 'GET',
        token
      });
    }
  },
  
  // Test de connexion
  testConnection: async (token?: string): Promise<{ success: boolean; user?: string; error?: string }> => {
    try {
      const userData = await notionRequest({
        endpoint: '/users/me',
        method: 'GET',
        token,
        showErrorToast: false
      });
      
      return {
        success: true,
        user: userData?.name || 'Utilisateur Notion'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  // Méthode simplifiée pour exécuter une requête personnalisée
  request: notionRequest
};

// Exporter par défaut pour un accès facile
export default notionCentralService;
