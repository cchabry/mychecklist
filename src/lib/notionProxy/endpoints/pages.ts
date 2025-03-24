import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';

// Complétons les méthodes manquantes dans le mockData
if (!mockData.createPage) {
  mockData.createPage = (data: any) => {
    const newId = `page_${Date.now()}`;
    return { id: newId, ...data };
  };
}

if (!mockData.updatePage) {
  mockData.updatePage = (id: string, data: any) => {
    return { id, ...data, updated: true };
  };
}

if (!mockData.getPage) {
  mockData.getPage = (id: string) => {
    const existingPage = mockData.pages.find((page: any) => page.id === id);
    if (existingPage) {
      return existingPage;
    }
    return { id, notFound: true };
  };
}

if (!mockData.getPages) {
  mockData.getPages = () => {
    return mockData.pages;
  };
}

if (!mockData.getProjectPages) {
  mockData.getProjectPages = (projectId: string) => {
    return mockData.pages.filter((page: any) => page.projectId === projectId);
  };
}

if (!mockData.createSamplePage) {
  mockData.createSamplePage = (pageData: any) => {
    const newPage = {
      id: `page_${Date.now()}`,
      projectId: pageData.projectId,
      url: pageData.url,
      title: pageData.title || 'Nouvelle page',
      description: pageData.description || '',
      order: mockData.pages.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockData.pages.push(newPage);
    return newPage;
  };
}

if (!mockData.updateSamplePage) {
  mockData.updateSamplePage = (pageId: string, pageData: any) => {
    const pageIndex = mockData.pages.findIndex((p: any) => p.id === pageId);
    if (pageIndex === -1) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    mockData.pages[pageIndex] = {
      ...mockData.pages[pageIndex],
      ...pageData,
      updatedAt: new Date().toISOString()
    };
    return mockData.pages[pageIndex];
  };
}

if (!mockData.deletePage) {
  mockData.deletePage = (pageId: string) => {
    const pageIndex = mockData.pages.findIndex((p: any) => p.id === pageId);
    if (pageIndex === -1) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    mockData.pages.splice(pageIndex, 1);
    return { success: true, id: pageId };
  };
}

// Pages API endpoints

/**
 * Récupère toutes les pages d'un utilisateur Notion
 * @param token Token d'authentification Notion
 */
export async function getPages(token?: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getPages();
  }
  
  try {
    // En mode réel, tenter d'utiliser l'API Notion
    // Implémentation à venir avec le token approprié
    if (!token) {
      throw new Error('Token Notion requis');
    }
    
    // Exemple d'implémentation (à adapter)
    // const notion = new Client({ auth: token });
    // const response = await notion.search({
    //   filter: {
    //     property: 'object',
    //     value: 'page'
    //   }
    // });
    // return response.results;
    
    throw new Error('API Notion non implémentée pour les pages');
  } catch (error) {
    console.error('Erreur lors de la récupération des pages Notion:', error);
    throw error;
  }
}

/**
 * Récupère une page spécifique par ID
 * @param id ID de la page
 * @param token Token d'authentification Notion (optionnel)
 */
export async function getPageById(id: string, token?: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getPage(id);
  }
  
  try {
    // En mode réel, tenter d'utiliser l'API Notion
    if (!token) {
      token = localStorage.getItem('notion_api_key') || '';
      if (!token) {
        throw new Error('Token Notion requis');
      }
    }
    
    // Exemple d'implémentation (à adapter)
    // const notion = new Client({ auth: token });
    // const response = await notion.pages.retrieve({ page_id: id });
    // return response;
    
    throw new Error('API Notion non implémentée pour récupérer une page');
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page Notion ${id}:`, error);
    throw error;
  }
}

/**
 * Crée une nouvelle page dans une base de données
 * @param data Les données pour créer la page
 * @param token Token d'authentification Notion
 */
export async function create(data: any, token?: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Créer une page mock avec un ID généré
    return mockData.createPage(data);
  }
  
  try {
    // En mode réel, tenter d'utiliser l'API Notion
    if (!token) {
      throw new Error('Token Notion requis');
    }
    
    // Implémenter l'appel à l'API Notion ici
    throw new Error('API Notion non implémentée pour créer une page');
  } catch (error) {
    console.error('Erreur lors de la création de la page Notion:', error);
    throw error;
  }
}

/**
 * Met à jour une page existante
 * @param pageId ID de la page à mettre à jour
 * @param data Les données à mettre à jour
 * @param token Token d'authentification Notion
 */
export async function update(pageId: string, data: any, token?: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Mettre à jour la page mock
    return mockData.updatePage(pageId, data);
  }
  
  try {
    // En mode réel, tenter d'utiliser l'API Notion
    if (!token) {
      throw new Error('Token Notion requis');
    }
    
    // Implémenter l'appel à l'API Notion ici
    throw new Error('API Notion non implémentée pour mettre à jour une page');
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la page Notion ${pageId}:`, error);
    throw error;
  }
}

/**
 * Récupère une page existante
 * @param pageId ID de la page à récupérer
 * @param token Token d'authentification Notion
 */
export async function retrieve(pageId: string, token?: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Récupérer la page mock
    return mockData.getPage(pageId);
  }
  
  try {
    // En mode réel, tenter d'utiliser l'API Notion
    if (!token) {
      throw new Error('Token Notion requis');
    }
    
    // Implémenter l'appel à l'API Notion ici
    throw new Error('API Notion non implémentée pour récupérer une page');
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page Notion ${pageId}:`, error);
    throw error;
  }
}

// Cette fonction vérifie si l'utilisateur est temporairement en mode réel
export const isTemporarilyForcedReal = () => {
  return !operationMode.isDemoMode;
};
