
// Exporter les services
export { errorCounter } from './errorCounter';
export { structuredLogger } from '@/services/notion/logging/structuredLogger';

// Exporter les types
export * from '@/services/notion/errorHandling/types';

// Initialiser le système de monitoring
export const initMonitoring = () => {
  // Configurer le logger
  structuredLogger.configure({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    consoleOutput: true,
    jsonOutput: false
  });
  
  // Log initial
  structuredLogger.info('Système de monitoring Notion initialisé', {
    environment: process.env.NODE_ENV,
    timestamp: Date.now()
  }, {
    source: 'MonitoringSystem',
    tags: ['startup', 'monitoring']
  });
  
  // Configurer les seuils d'alerte par défaut
  errorCounter.configureThresholds({
    errorRatePerMinute: 10,
    errorRatePerHour: 50,
    byErrorType: {
      'auth': 3,
      'permission': 3,
      'rate_limit': 5
    }
  });
  
  return {
    structuredLogger,
    errorCounter
  };
};
