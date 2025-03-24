
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';

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
export async function retrieve(id: string, token?: string) {
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
 * Create a page in Notion
 * @param data Page data
 * @param token Authentication token
 */
export async function create(data: any, token?: string) {
  // Check if we're in demo mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Simulate random network error
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Return mock data
    if (mockData.createPage) {
      return mockData.createPage(data);
    }
    
    // Fallback mock implementation
    return {
      id: `page_${Date.now()}`,
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      ...data
    };
  }
  
  try {
    // In real mode, try to use Notion API
    if (!token) {
      token = localStorage.getItem('notion_api_key') || '';
      if (!token) {
        throw new Error('Notion token required');
      }
    }
    
    // Implementation to be added
    throw new Error('Notion API not implemented for creating a page');
  } catch (error) {
    console.error('Error creating Notion page:', error);
    throw error;
  }
}

/**
 * Update a page in Notion
 * @param id Page ID
 * @param data Update data
 * @param token Authentication token
 */
export async function update(id: string, data: any, token?: string) {
  // Check if we're in demo mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Simulate random network error
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Return mock data
    if (mockData.updatePage) {
      return mockData.updatePage(id, data);
    }
    
    // Fallback mock implementation
    const page = mockData.getPage(id);
    if (!page) {
      throw new Error(`Page ${id} not found`);
    }
    
    return {
      ...page,
      ...data,
      last_edited_time: new Date().toISOString()
    };
  }
  
  try {
    // In real mode, try to use Notion API
    if (!token) {
      token = localStorage.getItem('notion_api_key') || '';
      if (!token) {
        throw new Error('Notion token required');
      }
    }
    
    // Implementation to be added
    throw new Error('Notion API not implemented for updating a page');
  } catch (error) {
    console.error(`Error updating Notion page ${id}:`, error);
    throw error;
  }
}

/**
 * Get page by ID - Alias for retrieve for backward compatibility
 */
export const getPageById = retrieve;

// Cette fonction vérifie si l'utilisateur est temporairement en mode réel
export const isTemporarilyForcedReal = () => {
  return !operationMode.isDemoMode;
};

// Export an object to match the expected structure
export default {
  getPages,
  retrieve,
  create,
  update,
  getPageById,
  isTemporarilyForcedReal
};
