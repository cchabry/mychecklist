
import { useState, useEffect } from 'react';
import { autoRetryHandler } from './autoRetry';
import { NotionError, NotionErrorType, AutoRetryConfig } from './types';

/**
 * Hook pour utiliser le service de retry automatique
 */
export function useAutoRetry() {
  const [isEnabled, setIsEnabled] = useState(autoRetryHandler.isEnabled());
  const [config, setConfig] = useState<AutoRetryConfig>(autoRetryHandler.getConfig());
  
  // Suivre les changements de configuration
  useEffect(() => {
    // Synchroniser l'état local avec la configuration du service
    setIsEnabled(autoRetryHandler.isEnabled());
    setConfig(autoRetryHandler.getConfig());
  }, []);
  
  /**
   * Activer le retry automatique
   */
  const enable = () => {
    autoRetryHandler.enable();
    setIsEnabled(true);
  };
  
  /**
   * Désactiver le retry automatique
   */
  const disable = () => {
    autoRetryHandler.disable();
    setIsEnabled(false);
  };
  
  /**
   * Configurer le retry automatique
   */
  const configure = (newConfig: Partial<AutoRetryConfig>) => {
    autoRetryHandler.configure(newConfig);
    setConfig(autoRetryHandler.getConfig());
  };
  
  /**
   * Ajouter un type d'erreur à retrier automatiquement
   */
  const addErrorTypeToRetry = (errorType: NotionErrorType) => {
    if (!config.typesToRetry.includes(errorType)) {
      const newTypes = [...config.typesToRetry, errorType];
      configure({ typesToRetry: newTypes });
    }
  };
  
  /**
   * Retirer un type d'erreur à retrier automatiquement
   */
  const removeErrorTypeToRetry = (errorType: NotionErrorType) => {
    if (config.typesToRetry.includes(errorType)) {
      const newTypes = config.typesToRetry.filter(type => type !== errorType);
      configure({ typesToRetry: newTypes });
    }
  };
  
  /**
   * Définir le nombre maximum de tentatives
   */
  const setMaxRetries = (maxRetries: number) => {
    configure({ maxRetries });
  };
  
  /**
   * Définir le délai entre les tentatives
   */
  const setDelayMs = (delayMs: number) => {
    configure({ delayMs });
  };
  
  /**
   * Wrapper pour handle l'erreur et retrier automatiquement
   */
  const handleError = async <T>(
    error: NotionError | Error,
    operation: () => Promise<T>,
    options: {
      context?: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: NotionError) => void;
    } = {}
  ): Promise<T> => {
    // Convertir en NotionError si nécessaire
    const notionError: NotionError = (error as NotionError).type !== undefined 
      ? (error as NotionError)
      : {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          type: NotionErrorType.UNKNOWN,
          message: error.message,
          name: error.name,
          stack: error.stack,
          retryable: false,
          context: options.context
        };
    
    try {
      return await autoRetryHandler.handleError(notionError, operation, options);
    } catch (err) {
      // Si l'erreur est déjà gérée par le retryHandler, la propager
      throw err;
    }
  };
  
  return {
    isEnabled,
    config,
    enable,
    disable,
    configure,
    addErrorTypeToRetry,
    removeErrorTypeToRetry,
    setMaxRetries,
    setDelayMs,
    handleError
  };
}
