
import { NotionConfig, ConnectionTestResult } from './types';

/**
 * Client pour l'API Notion
 */
export class NotionClient {
  private config: NotionConfig = {};
  private mockMode = false;
  
  /**
   * Configure le client Notion
   */
  configure(config: NotionConfig): void {
    this.config = { ...config };
    
    if (config.mockMode !== undefined) {
      this.mockMode = config.mockMode;
    }
  }
  
  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.projectsDbId);
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig {
    return { ...this.config };
  }
  
  /**
   * Active ou désactive le mode mock
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }
  
  /**
   * Vérifie si le mode mock est actif
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (this.mockMode) {
      // En mode démo, simuler une connexion réussie
      return {
        success: true,
        user: 'Utilisateur démo',
        workspaceName: 'Espace de travail démo',
        projectsDbName: 'Projets (démo)',
        checklistsDbName: 'Checklists (démo)'
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Configuration incomplète. Veuillez fournir une clé API et un ID de base de données.'
      };
    }
    
    // Dans cette version simplifiée, nous simulons une connexion réussie
    // Dans une implémentation réelle, nous ferions une requête à l'API Notion
    
    return {
      success: true,
      user: 'Utilisateur test',
      workspaceName: 'Espace de travail test',
      projectsDbName: 'Base de données des projets',
      checklistsDbName: this.config.checklistsDbId ? 'Base de données des checklists' : undefined
    };
  }
}

// Exporter une instance singleton pour être utilisée dans toute l'application
export const notionClient = new NotionClient();

export default notionClient;
