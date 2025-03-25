
import { useEffect, useState } from 'react';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';
import { LogLevel, StructuredLoggerOptions } from '@/services/notion/types/unified';

interface UseMonitoringInitOptions {
  logLevel?: LogLevel;
  maxLogs?: number;
  enablePersistence?: boolean;
}

/**
 * Hook pour initialiser le système de monitoring
 */
export function useMonitoringInit(options: UseMonitoringInitOptions = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Configurer le logger structuré
    const loggerConfig: Partial<StructuredLoggerOptions> = {
      minLevel: options.logLevel || LogLevel.INFO,
      maxLogs: options.maxLogs || 200,
      persistLogs: options.enablePersistence || false
    };
    
    try {
      if (structuredLogger) {
        // Vérifier si la méthode configure existe
        if (typeof structuredLogger.configure === 'function') {
          structuredLogger.configure(loggerConfig);
        } else if (typeof structuredLogger.setMinLevel === 'function') {
          // Fallback: configurer uniquement le niveau minimal
          structuredLogger.setMinLevel(loggerConfig.minLevel || LogLevel.INFO);
        }
        
        // Log initial
        structuredLogger.info('Système de monitoring initialisé', loggerConfig, { 
          source: 'MonitoringInit'
        });
        
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du monitoring:', error);
    }
    
  }, [options.logLevel, options.maxLogs, options.enablePersistence]);
  
  return {
    isInitialized,
    logger: structuredLogger
  };
}
