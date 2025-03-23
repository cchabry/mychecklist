import { operationMode } from '@/services/operationMode';
import { notionErrorService } from './errorService';
import { retryQueueService } from './retryQueue';
import { NotionError, NotionErrorType, AutoRetryConfig } from './types';

// Configuration par défaut
const DEFAULT_CONFIG: AutoRetryConfig = {
  enabled: true,
  maxRetries: 3,
  delayMs: 2000,
  typesToRetry: [
    NotionErrorType.NETWORK,
    NotionErrorType.RATE_LIMIT,
    NotionErrorType.TIMEOUT
  ]
};

/**
 * Gestionnaire automatique de retry pour les erreurs Notion
 */
class AutoRetryHandler {
  private config: AutoRetryConfig = { ...DEFAULT_CONFIG };
  
  /**
   * Initialise le gestionnaire de retry automatique
   */
  initialize() {
    // S'abonner aux erreurs Notion
    notionErrorService.subscribe(this.handleNewErrors.bind(this));
    
    // Configurer les callbacks de retry
    retryQueueService.updateCallbacks({
      onSuccess: this.handleRetrySuccess.bind(this),
      onFailure: this.handleRetryFailure.bind(this),
      onProcessingComplete: this.handleProcessingComplete.bind(this)
    });
    
    console.log('AutoRetryHandler initialisé');
  }
  
  /**
   * Vérifie si le service est activé
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  /**
   * Active le service
   */
  enable(): void {
    this.config.enabled = true;
  }
  
  /**
   * Désactive le service
   */
  disable(): void {
    this.config.enabled = false;
  }
  
  /**
   * Obtient la configuration actuelle
   */
  getConfig(): AutoRetryConfig {
    return { ...this.config };
  }
  
  /**
   * Met à jour la configuration
   */
  configure(newConfig: Partial<AutoRetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Traite les nouvelles erreurs pour détecter celles qui peuvent être automatiquement retentées
   */
  handleNewErrors(errors: NotionError[]) {
    if (!this.isEnabled()) return;
    
    // Traiter uniquement les nouvelles erreurs retryables
    const retryableErrors = errors.filter(error => 
      error.retryable && 
      this.config.typesToRetry.includes(error.type) &&
      !retryQueueService.hasOperation(error.operation || '')
    );
    
    if (retryableErrors.length === 0) return;
    
    console.log(`AutoRetryHandler: ${retryableErrors.length} nouvelles erreurs retryables détectées`);
    
    // Ajouter automatiquement à la file d'attente en fonction du type d'erreur
    retryableErrors.forEach(error => {
      // Pour les erreurs CORS, tenter de passer en mode démo
      if (error.type === NotionErrorType.CORS) {
        const errorMessage = typeof error.message === 'string' ? error.message : 'Erreur CORS détectée';
        const contextStr = error.context ? 
                          (typeof error.context === 'string' ? 
                            error.context : 
                            JSON.stringify(error.context)) : 
                          "Erreur CORS détectée";
                          
        operationMode.handleConnectionError(
          new Error(errorMessage),
          contextStr
        );
      }
    });
  }
  
  /**
   * Gère le succès d'une opération retry
   */
  handleRetrySuccess(operation) {
    console.log(`AutoRetryHandler: Opération ${operation.id} réussie`);
    
    // Si nous avons une série de succès, tenter de revenir en mode réel
    if (retryQueueService.getStats().completedOperations > 2) {
      // Utiliser la méthode correcte de l'API operationMode
      this.attemptToEnableRealMode();
    }
  }
  
  /**
   * Tente de revenir en mode réel
   */
  private attemptToEnableRealMode() {
    // Vérifier si le mode est actuellement démo
    if (operationMode.getMode() === 'demo') {
      console.log("AutoRetryHandler: Tentative de retour en mode réel après plusieurs opérations réussies");
      operationMode.enableRealMode();
    }
  }
  
  /**
   * Gère l'échec d'une opération retry
   */
  handleRetryFailure(operation, error) {
    console.log(`AutoRetryHandler: Échec de l'opération ${operation.id}`, error);
    
    // Si trop d'échecs, passer en mode démo
    if (operation.currentRetries >= operation.maxRetries) {
      operationMode.handleConnectionError(
        error,
        `Échec après ${operation.maxRetries} tentatives: ${operation.operation}`
      );
    }
  }
  
  /**
   * Gère la fin du traitement de la file d'attente
   */
  handleProcessingComplete(stats) {
    console.log('AutoRetryHandler: Traitement de la file terminé', stats);
  }
  
  /**
   * Gère une erreur et tente de l'exécuter automatiquement
   */
  async handleError<T>(
    error: NotionError, 
    operation: () => Promise<T>, 
    options: {
      context?: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: Error | NotionError) => void;
    } = {}
  ): Promise<T> {
    if (!this.isEnabled() || !this.shouldRetry(error)) {
      if (options.onFailure) {
        // Acceptons NotionError et Error pour une meilleure compatibilité
        options.onFailure(error);
      }
      throw error;
    }
    
    // Enqueue l'opération
    const operationId = retryQueueService.enqueue(
      operation,
      options.context || error.context || 'Auto retry operation',
      {
        maxRetries: options.maxRetries || this.config.maxRetries,
        onSuccess: options.onSuccess,
        onFailure: options.onFailure
      }
    );
    
    console.log(`Opération ${operationId} mise en file d'attente pour retry automatique`);
    
    // Créer une nouvelle promesse qui sera résolue quand l'opération sera terminée
    return new Promise<T>((resolve, reject) => {
      // TODO: Implémenter une attente de la fin de l'opération
      // Pour l'instant, on échoue immédiatement pour permettre à l'appelant de gérer l'erreur
      reject(error);
    });
  }
  
  /**
   * Détermine si une erreur devrait être retentée
   */
  private shouldRetry(error: NotionError): boolean {
    return error.retryable !== false && 
           this.config.typesToRetry.includes(error.type);
  }
}

// Créer et exporter une instance unique
export const autoRetryHandler = new AutoRetryHandler();
