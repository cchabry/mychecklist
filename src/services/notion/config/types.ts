
/**
 * Types pour la configuration Notion
 */

export interface NotionOAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export interface NotionDatabaseIds {
  projects: string;
  checklists?: string;
  [key: string]: string | undefined;
}

export interface NotionConfig {
  /**
   * Clé API Notion (token d'intégration)
   */
  apiKey?: string;
  
  /**
   * Identifiants des bases de données Notion
   */
  databaseIds?: NotionDatabaseIds;
  
  /**
   * Mode d'opération
   * 'real' - Utilise l'API Notion réelle
   * 'demo' - Utilise des données de démonstration
   * 'auto' - Détermine automatiquement le mode en fonction de la connectivité
   */
  operationMode?: 'real' | 'demo' | 'auto';
  
  /**
   * Configuration OAuth pour Notion
   */
  oauth?: NotionOAuthConfig;
  
  /**
   * Options de monitoring et de journalisation
   */
  monitoring?: {
    logLevel?: string;
    enableConsoleOutput?: boolean;
    enableJsonOutput?: boolean;
    errorThresholds?: AlertThresholdConfig;
  };
}

/**
 * Configuration des seuils d'alerte pour les erreurs
 */
export interface AlertThresholdConfig {
  /**
   * Nombre total d'erreurs par heure avant alerte
   */
  totalErrorsPerHour?: number;
  
  /**
   * Nombre total d'erreurs par minute avant alerte
   */
  totalErrorsPerMinute?: number;
  
  /**
   * Nombre d'erreurs API par heure avant alerte
   */
  apiErrorsPerHour?: number;
  
  /**
   * Nombre d'erreurs réseau par minute avant alerte
   */
  networkErrorsPerMinute?: number;
  
  /**
   * Nombre d'erreurs d'authentification par heure avant alerte
   */
  authErrorsPerHour?: number;
  
  [key: string]: number | undefined;
}
