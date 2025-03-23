
import { NotionError, NotionErrorType } from './types';
import { notionRetryQueue } from './retryQueue';

/**
 * Configuration pour le retry automatique par type d'erreur
 */
interface AutoRetryConfig {
  enabled: boolean;
  maxRetries: number;
  typesToRetry: NotionErrorType[];
  delayMs: number;
}

/**
 * Gestionnaire de retry automatique pour les erreurs Notion
 */
class AutoRetryHandler {
  private config: AutoRetryConfig = {
    enabled: true,
    maxRetries: 3,
    typesToRetry: [
      NotionErrorType.NETWORK,
      NotionErrorType.RATE_LIMIT
    ],
    delayMs: 2000
  };

  /**
   * Configure le gestionnaire de retry
   */
  public configure(config: Partial<AutoRetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Tente de récupérer d'une erreur en réessayant l'opération
   */
  public handleError<T>(
    error: NotionError,
    operation: () => Promise<T>,
    options: {
      context?: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: NotionError) => void;
    } = {}
  ): Promise<T> {
    // Vérifier si le retry est activé et si le type d'erreur est éligible
    if (!this.config.enabled || !this.config.typesToRetry.includes(error.type)) {
      return Promise.reject(error);
    }

    // Déterminer le nombre max de tentatives
    const maxRetries = options.maxRetries ?? this.config.maxRetries;

    // Ajouter l'opération à la file d'attente
    const operationId = notionRetryQueue.enqueue(
      operation,
      { 
        operation: options.context || 'Opération Notion', 
        errorType: error.type,
        originalMessage: error.message
      },
      {
        maxRetries,
        onSuccess: options.onSuccess,
        onFailure: options.onFailure
      }
    );

    // Retourner une promesse qui sera résolue si l'opération réussit
    return new Promise((resolve, reject) => {
      // Stocker les callbacks originaux
      const originalSuccess = options.onSuccess;
      const originalFailure = options.onFailure;

      // Remplacer le callback de succès pour résoudre la promesse
      notionRetryQueue.operations.get(operationId)!.onSuccess = result => {
        if (originalSuccess) originalSuccess(result);
        resolve(result);
      };

      // Remplacer le callback d'échec pour rejeter la promesse
      notionRetryQueue.operations.get(operationId)!.onFailure = error => {
        if (originalFailure) originalFailure(error);
        reject(error);
      };
    });
  }

  /**
   * Active le retry automatique
   */
  public enable(): void {
    this.config.enabled = true;
  }

  /**
   * Désactive le retry automatique
   */
  public disable(): void {
    this.config.enabled = false;
  }

  /**
   * Vérifie si le retry automatique est activé
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Récupère la configuration actuelle
   */
  public getConfig(): AutoRetryConfig {
    return { ...this.config };
  }
}

// Exporter l'instance du gestionnaire
export const autoRetryHandler = new AutoRetryHandler();
