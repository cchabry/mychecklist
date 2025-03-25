
import { useEffect, useState } from 'react';
import { initMonitoring } from '@/services/notion/monitoring';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';
import { LogLevel } from '@/services/notion/errorHandling/types';

/**
 * Hook pour initialiser le système de monitoring
 */
export function useMonitoringInit(options: {
  logLevel?: LogLevel;
  enableConsoleOutput?: boolean;
  enableJsonOutput?: boolean;
  automaticErrorLogging?: boolean;
} = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Configuration par défaut
    const {
      logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsoleOutput = true,
      enableJsonOutput = false,
      automaticErrorLogging = true
    } = options;
    
    // Initialiser le système de monitoring
    const { structuredLogger } = initMonitoring();
    
    // Configurer le logger
    structuredLogger.configure({
      level: logLevel,
      consoleOutput: enableConsoleOutput,
      jsonOutput: enableJsonOutput
    });
    
    // Installer un gestionnaire d'erreurs global si demandé
    if (automaticErrorLogging) {
      // Stocker les gestionnaires d'origine
      const originalOnError = window.onerror;
      const originalOnUnhandledRejection = window.onunhandledrejection;
      
      // Gérer les erreurs non interceptées
      window.onerror = function(message, source, lineno, colno, error) {
        structuredLogger.error(
          `Erreur non gérée: ${message}`,
          error || { message, source, lineno, colno },
          {
            source: 'GlobalErrorHandler',
            tags: ['unhandled', 'global']
          }
        );
        
        // Appeler le gestionnaire original s'il existe
        if (originalOnError) {
          return originalOnError.call(this, message, source, lineno, colno, error);
        }
        
        return false;
      };
      
      // Installer un gestionnaire de promesses non gérées
      window.onunhandledrejection = function(event) {
        structuredLogger.error(
          'Promesse rejetée non gérée',
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            source: 'GlobalPromiseHandler',
            tags: ['unhandled', 'promise']
          }
        );
        
        // Appeler le gestionnaire original s'il existe
        if (originalOnUnhandledRejection) {
          return originalOnUnhandledRejection.call(this, event);
        }
      };
    }
    
    setIsInitialized(true);
    
    // Nettoyer à la désinstallation
    return () => {
      if (automaticErrorLogging) {
        // Restaurer les gestionnaires d'origine
        window.onerror = originalOnError;
        window.onunhandledrejection = originalOnUnhandledRejection;
      }
    };
  }, [options]);
  
  return {
    isInitialized,
    logger: structuredLogger
  };
}
