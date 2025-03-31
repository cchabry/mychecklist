
import { 
  ProxyAdapter, 
  DeploymentEnvironment, 
  HttpMethod, 
  RequestOptions, 
  ApiResponse, 
  ProxyAdapterConfig,
  ProxyErrorType,
  ProxyError
} from './types';

/**
 * Classe abstraite qui implémente les fonctionnalités de base communes à tous les adaptateurs de proxy
 * Les adaptateurs spécifiques à chaque environnement hériteront de cette classe
 */
export abstract class AbstractProxyAdapter implements ProxyAdapter {
  /**
   * Nom de l'adaptateur
   */
  readonly name: string;
  
  /**
   * Environnement associé à cet adaptateur
   */
  readonly environment: DeploymentEnvironment;
  
  /**
   * Configuration de l'adaptateur
   */
  protected config: ProxyAdapterConfig;
  
  /**
   * Indique si l'adaptateur a été initialisé
   */
  protected initialized: boolean = false;
  
  constructor(name: string, environment: DeploymentEnvironment) {
    this.name = name;
    this.environment = environment;
    this.config = {
      timeout: 30000, // 30 secondes par défaut
      debug: false
    };
  }
  
  /**
   * Initialise l'adaptateur avec la configuration fournie
   * À surcharger dans les classes dérivées si nécessaire
   */
  async initialize(config: ProxyAdapterConfig): Promise<boolean> {
    this.config = { ...this.config, ...config };
    this.initialized = true;
    return true;
  }
  
  /**
   * Vérifie si l'adaptateur est disponible dans l'environnement actuel
   * Doit être implémentée par chaque adaptateur
   */
  abstract isAvailable(): Promise<boolean>;
  
  /**
   * Effectue une requête HTTP via l'adaptateur
   * Cette méthode doit être implémentée par chaque adaptateur spécifique
   */
  abstract request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>>;
  
  /**
   * Méthodes d'aide pour les différents types de requêtes HTTP
   * Ces méthodes utilisent la méthode request() abstraite qui sera implémentée par chaque adaptateur
   */
  
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }
  
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }
  
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }
  
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
  
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
  
  /**
   * Utilitaires de gestion d'erreur qui peuvent être utilisés par tous les adaptateurs
   */
  
  /**
   * Crée un objet d'erreur standardisé à partir d'une erreur
   */
  protected createProxyError(
    error: any, 
    endpoint: string, 
    defaultType: ProxyErrorType = ProxyErrorType.Unknown
  ): ProxyError {
    // Déterminer le type d'erreur en fonction du message ou du statut
    let errorType = defaultType;
    let status: number | undefined = undefined;
    let message = 'Une erreur inconnue est survenue';
    
    if (error.status) {
      status = error.status;
      
      // Déterminer le type d'erreur en fonction du code de statut HTTP
      if (status === 401) {
        errorType = ProxyErrorType.Auth;
      } else if (status === 403) {
        errorType = ProxyErrorType.Permission;
      } else if (status === 404) {
        errorType = ProxyErrorType.NotFound;
      } else if (status === 408 || status === 504) {
        errorType = ProxyErrorType.Timeout;
      } else if (status >= 500) {
        errorType = ProxyErrorType.Server;
      } else if (status >= 400) {
        errorType = ProxyErrorType.Client;
      }
    }
    
    // Extraire le message d'erreur
    if (error.message) {
      message = error.message;
      
      // Analyser le message pour affiner le type d'erreur
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connexion')) {
        errorType = ProxyErrorType.Network;
      } else if (lowerMessage.includes('timeout') || lowerMessage.includes('expir') || lowerMessage.includes('délai')) {
        errorType = ProxyErrorType.Timeout;
      } else if (lowerMessage.includes('auth') || lowerMessage.includes('token')) {
        errorType = ProxyErrorType.Auth;
      } else if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) {
        errorType = ProxyErrorType.Permission;
      } else if (lowerMessage.includes('not found') || lowerMessage.includes('introuvable')) {
        errorType = ProxyErrorType.NotFound;
      }
    }
    
    return {
      type: errorType,
      message,
      originalError: error,
      status,
      endpoint,
      timestamp: Date.now()
    };
  }
  
  /**
   * Crée une réponse d'erreur standardisée
   */
  protected createErrorResponse<T>(error: ProxyError): ApiResponse<T> {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.type,
        status: error.status,
        details: error.originalError
      }
    };
  }
  
  /**
   * Crée une réponse de succès standardisée
   */
  protected createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data
    };
  }
  
  /**
   * Journalise un message si le mode debug est activé
   */
  protected log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[${this.name}] ${message}`, ...args);
    }
  }
}
