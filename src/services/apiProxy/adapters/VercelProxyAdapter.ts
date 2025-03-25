
import { 
  DeploymentEnvironment, 
  HttpMethod, 
  RequestOptions, 
  ApiResponse 
} from '../types';
import { AbstractProxyAdapter } from '../AbstractProxyAdapter';

/**
 * Adaptateur de proxy pour l'environnement Vercel
 * Utilise les API Routes de Next.js pour communiquer avec l'API Notion
 */
export class VercelProxyAdapter extends AbstractProxyAdapter {
  /**
   * URL de base pour les routes API Vercel
   */
  private apiBaseUrl: string = '/api';
  
  /**
   * Nom de la route API à utiliser
   */
  private proxyRouteName: string = 'notion-proxy';
  
  constructor() {
    super('VercelProxyAdapter', DeploymentEnvironment.Vercel);
  }
  
  /**
   * Initialise l'adaptateur avec la configuration fournie
   */
  async initialize(config: any): Promise<boolean> {
    await super.initialize(config);
    
    // Configurer l'URL de base des API routes si spécifiée
    if (config.apiBaseUrl) {
      this.apiBaseUrl = config.apiBaseUrl;
    }
    
    // Configurer le nom de la route API si spécifié
    if (config.proxyRouteName) {
      this.proxyRouteName = config.proxyRouteName;
    }
    
    return true;
  }
  
  /**
   * Vérifie si l'adaptateur est disponible dans l'environnement actuel
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Vérifier si nous sommes sur Vercel
      const isVercelEnvironment = 
        (typeof process !== 'undefined' && process.env.VERCEL) || 
        (typeof window !== 'undefined' && (
          window.location.hostname.includes('vercel.app') || 
          window.location.hostname.endsWith('.now.sh') ||
          (window as any).__NEXT_DATA__ !== undefined
        ));
      
      if (!isVercelEnvironment) {
        return false;
      }
      
      // Tester si l'API route est disponible
      const response = await fetch(`${this.apiBaseUrl}/${this.proxyRouteName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Si la réponse est 404, la route n'existe pas
      if (response.status === 404) {
        this.log('La route API Vercel de proxy n\'a pas été trouvée');
        return false;
      }
      
      // Vérifier si la réponse contient les informations attendues
      const data = await response.json();
      const isValid = data && (data.status === 'ok' || data.message?.includes('Notion proxy'));
      
      this.log('Test de disponibilité de l\'adaptateur Vercel:', isValid);
      return isValid;
    } catch (error) {
      this.log('Erreur lors du test de disponibilité de l\'adaptateur Vercel:', error);
      return false;
    }
  }
  
  /**
   * Effectue une requête à l'API via la route API Vercel
   */
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.apiBaseUrl}/${this.proxyRouteName}`;
      
      this.log(`Requête ${method} vers ${endpoint} via Vercel`);
      
      // Fusionner les en-têtes par défaut avec ceux fournis dans les options
      const headers = {
        'Content-Type': 'application/json',
        ...this.config.defaultHeaders,
        ...options?.headers
      };
      
      // Récupérer le token d'authentification des headers ou du localStorage
      const authToken = headers['Authorization'] || headers['authorization'] || localStorage.getItem('notion_api_key');
      
      // Préparer le corps de la requête à envoyer à la route API Vercel
      const body = {
        endpoint,
        method,
        body: data,
        token: authToken
      };
      
      // Effectuer la requête à la route API Vercel
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      // Analyser la réponse
      const responseData = await response.json();
      
      // Si la route API Vercel a généré une erreur
      if (!response.ok) {
        const error = this.createProxyError(
          { 
            status: response.status, 
            message: responseData.error || responseData.message || 'Erreur de la route API Vercel',
            ...responseData
          },
          endpoint
        );
        
        return this.createErrorResponse(error);
      }
      
      // Retourner la réponse formatée
      return this.createSuccessResponse(responseData);
    } catch (error) {
      // Gérer les erreurs de réseau ou autres
      const proxyError = this.createProxyError(error, endpoint);
      return this.createErrorResponse(proxyError);
    }
  }
}
