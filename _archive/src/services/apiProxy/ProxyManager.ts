
import { 
  ProxyAdapter, 
  DeploymentEnvironment, 
  ApiResponse, 
  HttpMethod, 
  RequestOptions,
  ProxyAdapterConfig
} from './types';
import { detectEnvironment } from './environmentDetector';

/**
 * Gestionnaire principal pour les adaptateurs de proxy API
 * Gère la sélection et l'utilisation des adaptateurs selon l'environnement
 */
export class ProxyManager {
  /**
   * Singleton instance
   */
  private static instance: ProxyManager;
  
  /**
   * Adaptateurs disponibles, indexés par environnement
   */
  private adapters: Map<DeploymentEnvironment, ProxyAdapter> = new Map();
  
  /**
   * Adaptateur actif actuel
   */
  private activeAdapter: ProxyAdapter | null = null;
  
  /**
   * Environnement détecté
   */
  private detectedEnvironment: DeploymentEnvironment;
  
  /**
   * Configuration globale
   */
  private globalConfig: ProxyAdapterConfig = {
    debug: false,
    timeout: 30000
  };
  
  /**
   * Constructeur privé pour le pattern Singleton
   */
  private constructor() {
    this.detectedEnvironment = detectEnvironment();
    console.log(`[ProxyManager] Environnement détecté: ${this.detectedEnvironment}`);
  }
  
  /**
   * Obtient l'instance singleton du gestionnaire
   */
  public static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }
  
  /**
   * Définit la configuration globale
   */
  public setGlobalConfig(config: ProxyAdapterConfig): void {
    this.globalConfig = { ...this.globalConfig, ...config };
    
    // Appliquer la configuration à l'adaptateur actif s'il existe
    if (this.activeAdapter) {
      this.activeAdapter.initialize(this.globalConfig);
    }
  }
  
  /**
   * Enregistre un adaptateur pour un environnement spécifique
   */
  public registerAdapter(adapter: ProxyAdapter): void {
    this.adapters.set(adapter.environment, adapter);
    console.log(`[ProxyManager] Adaptateur enregistré: ${adapter.name} pour ${adapter.environment}`);
  }
  
  /**
   * Initialise le gestionnaire avec les adaptateurs fournis
   * et sélectionne l'adaptateur approprié pour l'environnement actuel
   */
  public async initialize(adapters: ProxyAdapter[] = []): Promise<boolean> {
    // Enregistrer les adaptateurs fournis
    for (const adapter of adapters) {
      this.registerAdapter(adapter);
    }
    
    // Tenter d'activer l'adaptateur pour l'environnement détecté
    if (await this.activateAdapterForEnvironment(this.detectedEnvironment)) {
      return true;
    }
    
    // Si l'activation a échoué, essayer avec un adaptateur générique
    if (await this.activateAdapterForEnvironment(DeploymentEnvironment.Unknown)) {
      return true;
    }
    
    console.error('[ProxyManager] Aucun adaptateur compatible n\'a pu être activé');
    return false;
  }
  
  /**
   * Active l'adaptateur pour l'environnement spécifié
   */
  private async activateAdapterForEnvironment(environment: DeploymentEnvironment): Promise<boolean> {
    const adapter = this.adapters.get(environment);
    
    if (!adapter) {
      console.log(`[ProxyManager] Aucun adaptateur trouvé pour ${environment}`);
      return false;
    }
    
    try {
      // Vérifier si l'adaptateur est disponible dans l'environnement actuel
      if (await adapter.isAvailable()) {
        // Initialiser l'adaptateur avec la configuration globale
        await adapter.initialize(this.globalConfig);
        
        // Définir comme adaptateur actif
        this.activeAdapter = adapter;
        console.log(`[ProxyManager] Adaptateur activé: ${adapter.name}`);
        return true;
      } else {
        console.log(`[ProxyManager] Adaptateur ${adapter.name} n'est pas disponible dans cet environnement`);
      }
    } catch (error) {
      console.error(`[ProxyManager] Erreur lors de l'activation de l'adaptateur ${adapter.name}:`, error);
    }
    
    return false;
  }
  
  /**
   * Obtient l'adaptateur actif
   * Lance une erreur si aucun adaptateur n'est actif
   */
  private getActiveAdapter(): ProxyAdapter {
    if (!this.activeAdapter) {
      throw new Error("Aucun adaptateur de proxy n'est actif. Veuillez initialiser le gestionnaire de proxy.");
    }
    return this.activeAdapter;
  }
  
  /**
   * Effectue une requête via l'adaptateur actif
   */
  public async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      return await this.getActiveAdapter().request<T>(method, endpoint, data, options);
    } catch (error) {
      // Si l'adaptateur actif échoue, on pourrait essayer de basculer vers un autre adaptateur
      // dans une version plus avancée de ce gestionnaire
      console.error(`[ProxyManager] Erreur lors de la requête ${method} ${endpoint}:`, error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erreur inconnue lors de la requête",
          code: 'proxy_error'
        }
      };
    }
  }
  
  /**
   * Méthodes d'aide pour les différents types de requêtes HTTP
   */
  
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }
  
  public async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }
  
  public async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }
  
  public async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
  
  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Exporter l'instance singleton pour une utilisation facile
export const proxyManager = ProxyManager.getInstance();

// Fonction utilitaire pour initialiser le gestionnaire au démarrage de l'application
export async function initializeProxyManager(
  adapters: ProxyAdapter[] = [],
  config: ProxyAdapterConfig = {}
): Promise<boolean> {
  // Définir la configuration globale
  proxyManager.setGlobalConfig(config);
  
  // Initialiser avec les adaptateurs fournis
  return await proxyManager.initialize(adapters);
}
