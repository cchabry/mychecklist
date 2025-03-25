
import { 
  DeploymentEnvironment, 
  HttpMethod, 
  RequestOptions, 
  ApiResponse,
  ProxyErrorType
} from '../types';
import { AbstractProxyAdapter } from '../AbstractProxyAdapter';

/**
 * Adaptateur de proxy spécifique pour l'environnement Netlify
 * Utilise les fonctions Netlify pour communiquer avec l'API
 */
export class NetlifyProxyAdapter extends AbstractProxyAdapter {
  /**
   * URL de base pour les fonctions Netlify
   */
  private functionBaseUrl: string = '/.netlify/functions';
  
  /**
   * Nom de la fonction de proxy à utiliser
   */
  private proxyFunctionName: string = 'notion-proxy';
  
  constructor() {
    super('NetlifyProxyAdapter', DeploymentEnvironment.Netlify);
  }
  
  /**
   * Initialise l'adaptateur avec la configuration fournie
   */
  async initialize(config: any): Promise<boolean> {
    await super.initialize(config);
    
    // Configurer l'URL de base des fonctions si spécifiée
    if (config.functionBaseUrl) {
      this.functionBaseUrl = config.functionBaseUrl;
    }
    
    // Configurer le nom de la fonction de proxy si spécifié
    if (config.proxyFunctionName) {
      this.proxyFunctionName = config.proxyFunctionName;
    }
    
    return true;
  }
  
  /**
   * Vérifie si l'adaptateur est disponible dans l'environnement actuel
   */
  async isAvailable(): Promise<boolean> {
    console.log('Vérification de la disponibilité de l\'adaptateur Netlify');
    
    try {
      // Tentative d'appel à la fonction Netlify pour vérifier sa disponibilité
      const response = await fetch(`${this.functionBaseUrl}/${this.proxyFunctionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ping: true })
      });
      
      // Si la réponse est 404, la fonction n'existe pas
      if (response.status === 404) {
        this.log('La fonction Netlify de proxy n\'a pas été trouvée');
        return false;
      }
      
      // Vérifier si la réponse contient les informations attendues
      const data = await response.json();
      const isValid = data && (data.status === 'ok' || data.message?.includes('Notion proxy'));
      
      this.log('Test de disponibilité de l\'adaptateur Netlify:', isValid);
      return isValid;
    } catch (error) {
      this.log('Erreur lors du test de disponibilité de l\'adaptateur Netlify:', error);
      return false;
    }
  }
  
  /**
   * Effectue une requête à l'API via la fonction Netlify
   */
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.functionBaseUrl}/${this.proxyFunctionName}`;
      
      this.log(`Requête ${method} vers ${endpoint} via Netlify`);
      
      // Fusionner les en-têtes par défaut avec ceux fournis dans les options
      const headers = {
        'Content-Type': 'application/json',
        ...this.config.defaultHeaders,
        ...options?.headers
      };
      
      // Récupérer le token d'authentification des headers ou du localStorage
      const authToken = headers['Authorization'] || headers['authorization'] || localStorage.getItem('notion_api_key');
      
      if (!authToken) {
        this.log('Erreur: Token d\'authentification Notion manquant');
        // Création d'un objet ProxyError complet
        const proxyError = this.createProxyError(
          {
            status: 401,
            message: 'Token d\'authentification Notion manquant',
            type: ProxyErrorType.Auth
          },
          endpoint
        );
        return this.createErrorResponse(proxyError);
      }
      
      // Préparer le corps de la requête à envoyer à la fonction Netlify
      const body = {
        endpoint,
        method,
        body: data,
        token: authToken
      };
      
      this.log(`Appel à la fonction Netlify pour ${endpoint}`, body);
      
      // Effectuer la requête à la fonction Netlify
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      // Analyser la réponse
      const responseData = await response.json();
      
      // Si la fonction Netlify a généré une erreur
      if (!response.ok) {
        // Créer un objet d'erreur complet avec tous les champs requis
        const error = this.createProxyError(
          { 
            status: response.status, 
            message: responseData.error || responseData.message || 'Erreur de la fonction Netlify',
            type: response.status === 401 ? ProxyErrorType.Auth : 
                  response.status === 403 ? ProxyErrorType.Permission :
                  response.status === 404 ? ProxyErrorType.NotFound :
                  response.status >= 500 ? ProxyErrorType.Server :
                  ProxyErrorType.Client,
            ...responseData
          },
          endpoint
        );
        
        this.log(`Erreur de la fonction Netlify pour ${endpoint}:`, error);
        return this.createErrorResponse(error);
      }
      
      // Retourner la réponse formatée
      this.log(`Réponse reçue de la fonction Netlify pour ${endpoint}`);
      return this.createSuccessResponse(responseData);
    } catch (error) {
      // Gérer les erreurs de réseau ou autres
      this.log(`Erreur lors de l'appel à la fonction Netlify pour ${endpoint}:`, error);
      const proxyError = this.createProxyError(error, endpoint);
      return this.createErrorResponse(proxyError);
    }
  }
}
