
import { ErrorCounterStats, NotionErrorType, AlertThresholdConfig, NotionError } from '@/services/notion/errorHandling/types';
import { notionErrorService } from '@/services/notion/errorHandling/errorService';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';

/**
 * Service pour compter et agréger les erreurs
 */
export class ErrorCounter {
  private static instance: ErrorCounter;
  private stats: ErrorCounterStats = {
    total: 0,
    byType: {} as Record<NotionErrorType, number>,
    byEndpoint: {},
    byHour: {},
    byMinute: {}
  };
  private thresholds: AlertThresholdConfig = {};
  private subscribers: Array<(stats: ErrorCounterStats, alerts: string[]) => void> = [];
  private errorHistory: NotionError[] = [];
  private maxHistorySize: number = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Initialiser les compteurs par type
    Object.values(NotionErrorType).forEach(type => {
      this.stats.byType[type] = 0;
    });
    
    // S'abonner au service d'erreurs
    notionErrorService.subscribe(this.handleErrors.bind(this));
    
    // Configurer le nettoyage périodique des statistiques temporelles
    this.startCleanupInterval();
  }
  
  /**
   * Obtenir l'instance unique du compteur
   */
  public static getInstance(): ErrorCounter {
    if (!ErrorCounter.instance) {
      ErrorCounter.instance = new ErrorCounter();
    }
    return ErrorCounter.instance;
  }
  
  /**
   * Configurer les seuils d'alerte
   */
  public configureThresholds(thresholds: AlertThresholdConfig): void {
    this.thresholds = thresholds;
    structuredLogger.info('Seuils d\'alerte d\'erreurs configurés', thresholds, {
      source: 'ErrorCounter',
      tags: ['configuration', 'monitoring']
    });
  }
  
  /**
   * Gérer les erreurs reçues du service d'erreurs
   */
  private handleErrors(errors: NotionError[]): void {
    // Récupérer uniquement les nouvelles erreurs
    const newErrors = errors.filter(error => 
      !this.errorHistory.some(hist => hist.id === error.id)
    );
    
    if (newErrors.length === 0) return;
    
    // Mettre à jour l'historique des erreurs
    this.errorHistory = [
      ...newErrors,
      ...this.errorHistory
    ].slice(0, this.maxHistorySize);
    
    // Traiter chaque nouvelle erreur
    newErrors.forEach(error => this.recordError(error));
  }
  
  /**
   * Enregistrer une erreur dans les statistiques
   */
  public recordError(error: NotionError | Error, endpoint?: string): void {
    const timestamp = Date.now();
    const notionError = error instanceof Error && !('type' in error) 
      ? notionErrorService.createError(error.message, { retryable: false })
      : error as NotionError;
    
    // Incrémenter le compteur total
    this.stats.total++;
    
    // Incrémenter le compteur par type
    if (notionError.type) {
      this.stats.byType[notionError.type] = (this.stats.byType[notionError.type] || 0) + 1;
    }
    
    // Déterminer l'endpoint
    let errorEndpoint = endpoint;
    if (!errorEndpoint && notionError.operation) {
      errorEndpoint = notionError.operation;
    } else if (!errorEndpoint && 
               notionError.context && 
               typeof notionError.context === 'object' && 
               'endpoint' in notionError.context) {
      errorEndpoint = String(notionError.context.endpoint);
    }
    
    // Incrémenter le compteur par endpoint
    if (errorEndpoint) {
      this.stats.byEndpoint[errorEndpoint] = (this.stats.byEndpoint[errorEndpoint] || 0) + 1;
    }
    
    // Incrémenter les compteurs temporels
    const minute = Math.floor(timestamp / 60000);  // Minutes depuis l'époque
    const hour = Math.floor(timestamp / 3600000);  // Heures depuis l'époque
    
    this.stats.byMinute[minute] = (this.stats.byMinute[minute] || 0) + 1;
    this.stats.byHour[hour] = (this.stats.byHour[hour] || 0) + 1;
    
    // Enregistrer la dernière erreur
    this.stats.lastError = {
      timestamp,
      message: notionError.message,
      type: notionError.type
    };
    
    // Vérifier les seuils d'alerte
    const alerts = this.checkAlertThresholds();
    
    // Journaliser l'erreur
    structuredLogger.info('Erreur enregistrée', {
      errorType: notionError.type,
      endpoint: errorEndpoint,
      timestamp,
      message: notionError.message,
      stats: {
        total: this.stats.total,
        byType: this.stats.byType[notionError.type],
        byEndpoint: errorEndpoint ? this.stats.byEndpoint[errorEndpoint] : undefined,
      }
    }, {
      source: 'ErrorCounter',
      tags: ['error', 'monitoring', notionError.type]
    });
    
    // Notifier les abonnés
    this.notifySubscribers(alerts);
  }
  
  /**
   * Nettoyer les compteurs temporels obsolètes
   */
  private cleanupTemporalStats(): void {
    const currentTime = Date.now();
    const currentMinute = Math.floor(currentTime / 60000);
    const currentHour = Math.floor(currentTime / 3600000);
    
    // Conserver uniquement les 60 dernières minutes
    const minutesToKeep = Object.keys(this.stats.byMinute)
      .map(Number)
      .filter(minute => minute > currentMinute - 60);
    
    // Conserver uniquement les 24 dernières heures
    const hoursToKeep = Object.keys(this.stats.byHour)
      .map(Number)
      .filter(hour => hour > currentHour - 24);
    
    // Reconstruire les objets avec uniquement les périodes à conserver
    const newByMinute: Record<number, number> = {};
    minutesToKeep.forEach(minute => {
      newByMinute[minute] = this.stats.byMinute[minute];
    });
    
    const newByHour: Record<number, number> = {};
    hoursToKeep.forEach(hour => {
      newByHour[hour] = this.stats.byHour[hour];
    });
    
    this.stats.byMinute = newByMinute;
    this.stats.byHour = newByHour;
  }
  
  /**
   * Démarrer le nettoyage périodique des statistiques temporelles
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Nettoyer les statistiques toutes les 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupTemporalStats();
    }, 15 * 60 * 1000);
  }
  
  /**
   * Vérifier si des seuils d'alerte sont dépassés
   */
  private checkAlertThresholds(): string[] {
    const alerts: string[] = [];
    
    // Vérifier le taux d'erreur par minute
    if (this.thresholds.errorRatePerMinute) {
      const currentMinute = Math.floor(Date.now() / 60000);
      const currentRate = this.stats.byMinute[currentMinute] || 0;
      
      if (currentRate >= this.thresholds.errorRatePerMinute) {
        const alert = `Le taux d'erreur par minute (${currentRate}) a dépassé le seuil configuré (${this.thresholds.errorRatePerMinute})`;
        alerts.push(alert);
        structuredLogger.warn(alert, { threshold: this.thresholds.errorRatePerMinute, current: currentRate }, {
          source: 'ErrorCounter',
          tags: ['alert', 'threshold', 'monitoring']
        });
      }
    }
    
    // Vérifier le taux d'erreur par heure
    if (this.thresholds.errorRatePerHour) {
      const currentHour = Math.floor(Date.now() / 3600000);
      const currentRate = this.stats.byHour[currentHour] || 0;
      
      if (currentRate >= this.thresholds.errorRatePerHour) {
        const alert = `Le taux d'erreur par heure (${currentRate}) a dépassé le seuil configuré (${this.thresholds.errorRatePerHour})`;
        alerts.push(alert);
        structuredLogger.warn(alert, { threshold: this.thresholds.errorRatePerHour, current: currentRate }, {
          source: 'ErrorCounter',
          tags: ['alert', 'threshold', 'monitoring']
        });
      }
    }
    
    // Vérifier les seuils par type d'erreur
    if (this.thresholds.byErrorType) {
      Object.entries(this.thresholds.byErrorType).forEach(([type, threshold]) => {
        const errorType = type as NotionErrorType;
        const currentCount = this.stats.byType[errorType] || 0;
        
        if (currentCount >= threshold) {
          const alert = `Le nombre d'erreurs de type ${type} (${currentCount}) a dépassé le seuil configuré (${threshold})`;
          alerts.push(alert);
          structuredLogger.warn(alert, { type, threshold, current: currentCount }, {
            source: 'ErrorCounter',
            tags: ['alert', 'threshold', 'monitoring', type]
          });
        }
      });
    }
    
    // Vérifier les seuils par endpoint
    if (this.thresholds.byEndpoint) {
      Object.entries(this.thresholds.byEndpoint).forEach(([endpoint, threshold]) => {
        const currentCount = this.stats.byEndpoint[endpoint] || 0;
        
        if (currentCount >= threshold) {
          const alert = `Le nombre d'erreurs pour l'endpoint ${endpoint} (${currentCount}) a dépassé le seuil configuré (${threshold})`;
          alerts.push(alert);
          structuredLogger.warn(alert, { endpoint, threshold, current: currentCount }, {
            source: 'ErrorCounter',
            tags: ['alert', 'threshold', 'monitoring']
          });
        }
      });
    }
    
    return alerts;
  }
  
  /**
   * S'abonner aux mises à jour des statistiques et alertes
   */
  public subscribe(callback: (stats: ErrorCounterStats, alerts: string[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Appeler immédiatement avec les valeurs actuelles
    const alerts = this.checkAlertThresholds();
    callback({ ...this.stats }, alerts);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }
  
  /**
   * Notifier les abonnés
   */
  private notifySubscribers(alerts: string[]): void {
    // Copier les statistiques pour éviter les modifications par les abonnés
    const statsCopy = { ...this.stats };
    
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(statsCopy, alerts);
      } catch (err) {
        console.error('Erreur lors de la notification d\'un abonné aux statistiques:', err);
      }
    });
  }
  
  /**
   * Obtenir les statistiques actuelles
   */
  public getStats(): ErrorCounterStats {
    return { ...this.stats };
  }
  
  /**
   * Réinitialiser les statistiques
   */
  public resetStats(): void {
    this.stats = {
      total: 0,
      byType: {} as Record<NotionErrorType, number>,
      byEndpoint: {},
      byHour: {},
      byMinute: {}
    };
    
    // Réinitialiser les compteurs par type
    Object.values(NotionErrorType).forEach(type => {
      this.stats.byType[type] = 0;
    });
    
    this.errorHistory = [];
    
    structuredLogger.info('Statistiques d\'erreurs réinitialisées', {}, {
      source: 'ErrorCounter',
      tags: ['reset', 'monitoring']
    });
    
    // Notifier les abonnés
    this.notifySubscribers([]);
  }
}

// Exporter une instance unique
export const errorCounter = ErrorCounter.getInstance();
