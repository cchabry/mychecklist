
/**
 * Client pour l'API Notion
 * 
 * Ce module fournit un client pour interagir avec l'API Notion
 * ou utiliser des données simulées en mode mock.
 */

import { 
  NotionConfig, 
  NotionAPIOptions,
  NotionAPIResponse
} from './types';

/**
 * Client pour l'API Notion
 */
class NotionClient {
  private config: NotionConfig | null = null;
  private mockMode: boolean = true;
  
  /**
   * Configure le client avec les options spécifiées
   * 
   * @param options - Options de configuration
   */
  configure(options: NotionAPIOptions): void {
    this.config = {
      token: options.token,
      projectsDbId: options.projectsDbId,
      checklistsDbId: options.checklistsDbId,
      exigencesDbId: options.exigencesDbId,
      samplePagesDbId: options.samplePagesDbId,
      auditsDbId: options.auditsDbId,
      evaluationsDbId: options.evaluationsDbId,
      actionsDbId: options.actionsDbId,
      progressDbId: options.progressDbId,
      useMockData: options.useMockData || false
    };
    
    // Définir le mode mock en fonction de la configuration
    this.mockMode = this.config.useMockData || false;
  }
  
  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    return this.config !== null && !!this.config.token;
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig | null {
    return this.config;
  }
  
  /**
   * Vérifie si le client est en mode mock
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
  
  /**
   * Définit le mode mock
   */
  setMockMode(useMock: boolean): void {
    this.mockMode = useMock;
    
    if (this.config) {
      this.config.useMockData = useMock;
    }
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<NotionAPIResponse<T>> {
    if (this.mockMode) {
      throw new Error("Méthode get non supportée en mode mock");
    }
    
    // Implémentation à venir
    throw new Error("Méthode get non implémentée");
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   */
  async post<T>(endpoint: string, data: any): Promise<NotionAPIResponse<T>> {
    if (this.mockMode) {
      throw new Error("Méthode post non supportée en mode mock");
    }
    
    // Implémentation à venir
    throw new Error("Méthode post non implémentée");
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   */
  async patch<T>(endpoint: string, data: any): Promise<NotionAPIResponse<T>> {
    if (this.mockMode) {
      throw new Error("Méthode patch non supportée en mode mock");
    }
    
    // Implémentation à venir
    throw new Error("Méthode patch non implémentée");
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionAPIResponse<T>> {
    if (this.mockMode) {
      throw new Error("Méthode delete non supportée en mode mock");
    }
    
    // Implémentation à venir
    throw new Error("Méthode delete non implémentée");
  }
  
  /**
   * Effectue une requête générique vers l'API Notion
   */
  async request<T>(method: string, endpoint: string, data?: any): Promise<NotionAPIResponse<T>> {
    if (this.mockMode) {
      throw new Error(`Méthode request (${method}) non supportée en mode mock`);
    }
    
    // Implémentation à venir
    throw new Error(`Méthode request (${method}) non implémentée`);
  }
}

// Créer et exporter une instance singleton
export const notionClient = new NotionClient();

// Export par défaut
export default notionClient;
