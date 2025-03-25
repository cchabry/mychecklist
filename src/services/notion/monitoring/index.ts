
/**
 * Point d'entrée pour les services de monitoring
 * Ce module initialise et configure les services de monitoring
 */

import { structuredLogger } from '../logging/structuredLogger';
import { errorCounter } from './errorCounter';
import { ErrorCounterOptions } from '../errorHandling/types';

/**
 * Interface des options de configuration du monitoring
 */
export interface MonitoringOptions {
  /**
   * Options de configuration du compteur d'erreurs
   */
  errorCounter?: ErrorCounterOptions;
  
  /**
   * Active ou désactive le monitoring
   */
  enabled?: boolean;
  
  /**
   * Niveau de détail des logs
   */
  logLevel?: string;
}

/**
 * Initialise le système de monitoring
 */
export function initMonitoring(options: MonitoringOptions = {}) {
  const { enabled = true, errorCounter: errorCounterOptions } = options;
  
  if (!enabled) {
    console.log('Système de monitoring désactivé');
    return { structuredLogger, errorCounter };
  }
  
  // Initialiser le compteur d'erreurs avec les options fournies
  if (errorCounterOptions) {
    // Configuration du compteur d'erreurs, si l'API le permet
    if (typeof errorCounter.configure === 'function') {
      errorCounter.configure(errorCounterOptions);
    }
  }
  
  console.log('Système de monitoring initialisé');
  
  return {
    structuredLogger,
    errorCounter
  };
}

export {
  structuredLogger,
  errorCounter
};
