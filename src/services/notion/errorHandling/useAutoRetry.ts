
import { useState } from 'react';
import { autoRetryHandler } from './autoRetry';
import { NotionError, NotionErrorType } from './types';

/**
 * Hook pour utiliser le service de retry automatique
 */
export function useAutoRetry() {
  const [isEnabled, setIsEnabled] = useState(autoRetryHandler.isEnabled());
  const [config, setConfig] = useState(autoRetryHandler.getConfig());
  
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
  const configure = (newConfig: Partial<typeof config>) => {
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
    const notionError = (error as NotionError).type !== undefined 
      ? (error as NotionError)
      : {
          ...error,
          type: NotionErrorType.UNKNOWN,
          name: 'NotionError',
          message: error.message,
          recoverable: false,
          recoveryActions: [],
          timestamp: new Date(),
          context: {},
          severity: null
        } as NotionError;
    
    return autoRetryHandler.handleError(notionError, operation, options);
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
