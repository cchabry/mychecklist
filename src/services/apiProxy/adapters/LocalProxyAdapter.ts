
import { 
  DeploymentEnvironment, 
  HttpMethod, 
  RequestOptions, 
  ApiResponse,
  ProxyErrorType
} from '../types';
import { AbstractProxyAdapter } from '../AbstractProxyAdapter';

/**
 * Adaptateur de proxy pour l'environnement de développement local
 * Effectue des requêtes directes à l'API Notion avec gestion CORS
 */
export class LocalProxyAdapter extends AbstractProxyAdapter {
  /**
   * URL de base de l'API Notion
   */
  private apiBaseUrl: string = 'https://api.notion.com/v1';
  
  /**
   * Version de l'API Notion
   */
  private notionApiVersion: string = '2022-06-28';
  
  constructor() {
    super('LocalProxyAdapter', DeploymentEnvironment.Local);
  }
  
  /**
   * Initialise l'adaptateur avec la configuration fournie
   */
  async initialize(config: any): Promise<boolean> {
    await super.initialize(config);
    
    // Configurer l'URL de base de l'API si spécifiée
    if (config.apiBaseUrl) {
      this.apiBaseUrl = config.apiBaseUrl;
    }
    
    // Configurer la version de l'API si spécifiée
    if (config.notionApiVersion) {
      this.notionApiVersion = config.notionApiVersion;
    }
    
    return true;
  }
  
  /**
   * Vérifie si l'adaptateur est disponible dans l'environnement actuel
   */
  async isAvailable(): Promise<boolean> {
    // En environnement local, nous sommes toujours disponibles
    // Mais on pourrait vérifier si on est réellement en local
    const isLocalHost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1');
    
    return isLocalHost || process.env.NODE_ENV === 'development';
  }
  
  /**
   * Effectue une requête à l'API Notion directement en environnement local
   * Note: Cela ne fonctionnera que si le serveur de développement a un proxy CORS configuré
   */
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      // Normaliser l'endpoint
      const normalizedEndpoint = this.normalizeEndpoint(endpoint);
      const url = `${this.apiBaseUrl}${normalizedEndpoint}`;
      
      this.log(`Requête ${method} vers ${url} en mode local`);
      
      // Récupérer le token d'API Notion
      const token = this.getNotionToken(options?.headers);
      
      if (!token) {
        return this.createErrorResponse({
          type: ProxyErrorType.Auth,
          message: "Token d'API Notion manquant",
          endpoint,
          timestamp: Date.now()
        });
      }
      
      // Préparer les en-têtes de la requête
      const headers = {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.notionApiVersion,
        ...this.config.defaultHeaders,
        ...options?.headers
      };
      
      // Préparer les options de la requête
      const fetchOptions: RequestInit = {
        method,
        headers,
        // En environnement de développement, utiliser le mode "cors"
        mode: 'cors'
      };
      
      // Ajouter le corps de la requête si nécessaire
      if (data && method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(data);
      }
      
      // Effectuer la requête
      const response = await fetch(url, fetchOptions);
      
      // Analyser la réponse
      const responseData = await response.json();
      
      // Si la requête a échoué
      if (!response.ok) {
        const error = this.createProxyError(
          { 
            status: response.status, 
            message: responseData.message || `Erreur ${response.status}`,
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
      
      // Si c'est une erreur CORS, suggérer d'utiliser un autre adaptateur
      if (error instanceof TypeError && 
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError')) {
        proxyError.message = "Erreur CORS détectée. En développement local, veuillez utiliser un proxy CORS ou configurer votre serveur de développement.";
        proxyError.type = ProxyErrorType.Network;
      }
      
      return this.createErrorResponse(proxyError);
    }
  }
  
  /**
   * Normalise un endpoint pour garantir qu'il commence par "/"
   */
  private normalizeEndpoint(endpoint: string): string {
    if (!endpoint.startsWith('/')) {
      return `/${endpoint}`;
    }
    return endpoint;
  }
  
  /**
   * Récupère le token Notion à partir des en-têtes ou du stockage local
   */
  private getNotionToken(headers?: Record<string, string>): string | null {
    // Vérifier d'abord dans les en-têtes
    if (headers?.Authorization) {
      return headers.Authorization;
    }
    
    if (headers?.authorization) {
      return headers.authorization;
    }
    
    // Vérifier ensuite dans le stockage local
    return localStorage.getItem('notion_api_key');
  }
}
