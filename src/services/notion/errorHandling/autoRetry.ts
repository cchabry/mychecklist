
import { operationMode } from '@/services/operationMode';
import { notionErrorService } from './errorService';
import { retryQueueService } from './retryQueue';
import { NotionError, NotionErrorType } from './types';

/**
 * Gestionnaire automatique de retry pour les erreurs Notion
 */
export const autoRetryHandler = {
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
  },
  
  /**
   * Traite les nouvelles erreurs pour détecter celles qui peuvent être automatiquement retentées
   */
  handleNewErrors(errors: NotionError[]) {
    // Traiter uniquement les nouvelles erreurs retryables
    const retryableErrors = errors.filter(error => 
      error.retryable && 
      !retryQueueService.hasOperation(error.operation || '')
    );
    
    if (retryableErrors.length === 0) return;
    
    console.log(`AutoRetryHandler: ${retryableErrors.length} nouvelles erreurs retryables détectées`);
    
    // Ajouter automatiquement à la file d'attente en fonction du type d'erreur
    retryableErrors.forEach(error => {
      // Pour les erreurs CORS, tenter de passer en mode démo
      if (error.type === NotionErrorType.CORS) {
        operationMode.handleConnectionError(
          new Error(error.message),
          error.context || "Erreur CORS détectée"
        );
      }
    });
  },
  
  /**
   * Gère le succès d'une opération retry
   */
  handleRetrySuccess(operation) {
    console.log(`AutoRetryHandler: Opération ${operation.id} réussie`);
    
    // Si nous avons une série de succès, tenter de revenir en mode réel
    if (retryQueueService.getStats().completedOperations > 2) {
      operationMode.checkAndEnableRealMode();
    }
  },
  
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
  },
  
  /**
   * Gère la fin du traitement de la file d'attente
   */
  handleProcessingComplete(stats) {
    console.log('AutoRetryHandler: Traitement de la file terminé', stats);
  }
};
