
import { toast } from 'sonner';
import { 
  NOTION_API_BASE, 
  VERCEL_PROXY_URL, 
  NOTION_API_VERSION, 
  REQUEST_TIMEOUT_MS,
  MAX_RETRY_ATTEMPTS,
  STORAGE_KEYS
} from './config';

/**
 * Fonction principale pour effectuer des requêtes à l'API Notion (directement ou via proxy)
 */
export const notionApiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  apiKey?: string
): Promise<any> => {
  // Récupérer la clé API depuis les paramètres ou localStorage
  const token = apiKey || localStorage.getItem(STORAGE_KEYS.API_KEY);
  
  if (!token) {
    throw new Error('Clé API Notion introuvable');
  }
  
  // Préparer les en-têtes avec l'autorisation
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_API_VERSION,
    ...options.headers
  };

  try {
    // Ajouter un timeout à la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    let response;
    let result;
    
    // Essayer d'utiliser le proxy Vercel d'abord
    try {
      console.log(`Utilisation du proxy Vercel pour: ${endpoint}`);
      
      // Préparer les données pour le proxy
      const proxyData = {
        endpoint,
        method: options.method || 'GET',
        token,
        body: options.body ? JSON.parse(options.body as string) : undefined
      };
      
      // Ajouter une logique de retry pour le proxy (3 tentatives)
      let retryCount = 0;
      let proxySuccess = false;
      
      while (retryCount < MAX_RETRY_ATTEMPTS && !proxySuccess) {
        try {
          if (retryCount > 0) {
            console.log(`Tentative ${retryCount + 1} d'appel au proxy Vercel...`);
          }
          
          // Appeler le proxy Vercel
          response = await fetch(VERCEL_PROXY_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(proxyData),
            signal: controller.signal,
            // Désactiver la mise en cache pour les requêtes au proxy
            cache: 'no-store',
            // Nécessaire pour les requêtes cross-origin
            mode: 'cors',
            credentials: 'omit'
          });
          
          // Vérifier si la réponse est OK
          if (response.ok) {
            result = await response.json();
            proxySuccess = true;
            console.log('Réponse du proxy Vercel reçue avec succès', response.status);
            break;
          } else {
            console.warn(`Échec de la réponse du proxy (${response.status}): ${response.statusText}`);
            result = await response.json().catch(() => ({ error: 'Impossible de lire la réponse' }));
            console.warn('Détails de l\'erreur:', result);
          }
        } catch (retryError) {
          console.warn(`Erreur lors de la tentative ${retryCount + 1}:`, retryError);
        }
        
        retryCount++;
        // Attendre un peu avant de réessayer (backoff exponentiel)
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          const delayMs = 1000 * Math.pow(2, retryCount - 1);
          console.log(`Attente de ${delayMs}ms avant la prochaine tentative...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      // Si le proxy a répondu avec succès
      if (proxySuccess) {
        clearTimeout(timeoutId);
        return result;
      } else {
        // Tous les essais ont échoué
        console.error('Toutes les tentatives d\'utilisation du proxy ont échoué');
        throw new Error('Échec de la communication avec le proxy Notion');
      }
    } catch (proxyError) {
      console.warn('Échec de l\'utilisation du proxy:', proxyError);
      
      // Si c'est une erreur réseau générique, proposer un message plus informatif
      if (proxyError.message?.includes('Failed to fetch')) {
        toast.error('Erreur de connexion au proxy', {
          description: 'Impossible de se connecter au proxy Notion. Vérifiez que le proxy est déployé et accessible.',
        });
        throw new Error('Failed to fetch - Échec de connexion au proxy Notion');
      }
      
      // Continuer avec l'appel direct si le proxy a échoué (qui échouera probablement avec CORS)
    }
    
    // Appel direct à l'API Notion (qui échouera probablement avec CORS dans le navigateur)
    console.log(`Tentative d'appel direct à l'API Notion: ${NOTION_API_BASE}${endpoint}`);
    
    response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('Erreur API Notion:', errorData);
      
      // Gérer les codes d'erreur courants
      if (response.status === 401) {
        throw new Error('Erreur d\'authentification Notion: Clé API invalide ou expirée');
      }
      
      if (response.status === 404) {
        throw new Error('Ressource Notion introuvable: Vérifiez l\'ID de la base de données');
      }
      
      if (response.status === 429) {
        throw new Error('Trop de requêtes Notion: Veuillez réessayer plus tard');
      }
      
      throw new Error(`Erreur Notion: ${errorData.message || response.statusText || 'Erreur inconnue'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Échec de la requête Notion:', error);
    
    // Gérer les erreurs spécifiques
    if (error.name === 'AbortError') {
      toast.error('Requête Notion expirée', {
        description: 'La connexion à Notion a pris trop de temps. Vérifiez votre connexion internet.',
      });
      throw new Error('Délai d\'attente de la requête Notion dépassé');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      const corsError = new Error('Failed to fetch');
      corsError.message = 'Failed to fetch - Limitation CORS';
      throw corsError;
    }
    
    throw error;
  }
};
