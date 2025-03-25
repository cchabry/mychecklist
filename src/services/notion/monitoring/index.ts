
import { structuredLogger } from '../logging/structuredLogger';
import { errorCounter } from './errorCounter';
import { ErrorReport } from '../errorHandling/types';

/**
 * Initialise le système de monitoring
 */
export function initMonitoring() {
  // Logger l'initialisation
  structuredLogger.info('Initialisation du système de monitoring Notion', {
    timestamp: new Date().toISOString()
  });
  
  // Initialiser les compteurs d'erreur
  errorCounter.reset();
  
  // Enregistrer un rapport d'initialisation pour le diagnostic
  structuredLogger.info('Système de monitoring prêt', {
    environment: process.env.NODE_ENV,
    browser: getBrowserInfo(),
    deployment: getDeploymentInfo()
  });
  
  // Retourner les outils de monitoring
  return {
    structuredLogger,
    errorCounter,
    
    // Utilitaire pour créer un rapport d'erreur
    createErrorReport(error: Error, context?: string): ErrorReport {
      // Incrémenter les compteurs appropriés
      errorCounter.increment(error);
      
      // Créer un rapport structuré
      return {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        context: context || 'Erreur non contextualisée',
        browser: getBrowserInfo(),
        counters: errorCounter.getStats()
      };
    }
  };
}

/**
 * Récupère des informations sur le navigateur
 */
function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
    doNotTrack: navigator.doNotTrack,
    cookiesEnabled: navigator.cookieEnabled
  };
}

/**
 * Récupère des informations sur le déploiement
 */
function getDeploymentInfo() {
  return {
    environment: process.env.NODE_ENV,
    buildTime: process.env.BUILD_TIME || 'unknown',
    version: process.env.VERSION || 'dev'
  };
}
