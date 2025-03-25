
import { 
  ErrorCounterStats, 
  AlertThresholdConfig, 
  NotionErrorType 
} from '@/services/notion/errorHandling/types';

/**
 * Service pour suivre et agréger les erreurs de l'API Notion
 */
class ErrorCounter {
  private stats: ErrorCounterStats = {
    total: 0,
    byType: {},
    byEndpoint: {},
    byMinute: {},
    byHour: {},
    lastUpdated: null
  };

  private thresholds: AlertThresholdConfig = {
    errorRatePerMinute: 10,
    errorRatePerHour: 50,
    byErrorType: {}
  };

  private subscribers: ((stats: ErrorCounterStats, alerts: string[]) => void)[] = [];
  private alertCache: string[] = [];

  /**
   * Configure les seuils d'alerte
   */
  configureThresholds(thresholds: AlertThresholdConfig): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds
    };
  }

  /**
   * S'abonner aux mises à jour de statistiques
   */
  subscribe(callback: (stats: ErrorCounterStats, alerts: string[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Récupérer les statistiques actuelles
   */
  getStats(): ErrorCounterStats {
    return { ...this.stats };
  }

  /**
   * Enregistrer une erreur
   */
  recordError(error: Error, endpoint?: string): void {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    const currentHour = Math.floor(now / 3600000);

    // Déterminer le type d'erreur
    let errorType: NotionErrorType = NotionErrorType.UNKNOWN;
    const message = error.message.toLowerCase();

    if (message.includes('auth') || message.includes('unauthorized')) {
      errorType = NotionErrorType.AUTH;
    } else if (message.includes('permission') || message.includes('access denied')) {
      errorType = NotionErrorType.PERMISSION;
    } else if (message.includes('not found') || message.includes('404')) {
      errorType = NotionErrorType.NOT_FOUND;
    } else if (message.includes('timeout') || message.includes('timed out')) {
      errorType = NotionErrorType.TIMEOUT;
    } else if (message.includes('rate limit') || message.includes('too many requests')) {
      errorType = NotionErrorType.RATE_LIMIT;
    } else if (message.includes('network') || message.includes('connection')) {
      errorType = NotionErrorType.NETWORK;
    } else if (message.includes('database') || message.includes('query')) {
      errorType = NotionErrorType.DATABASE;
    } else if (message.includes('invalid') || message.includes('validation')) {
      errorType = NotionErrorType.VALIDATION;
    } else if (message.includes('api') || message.includes('server')) {
      errorType = NotionErrorType.API;
    } else if (message.includes('cors') || message.includes('origin')) {
      errorType = NotionErrorType.CORS;
    }

    // Mettre à jour les statistiques
    this.stats.total++;
    this.stats.lastUpdated = now;

    // Par type
    this.stats.byType[errorType] = (this.stats.byType[errorType] || 0) + 1;

    // Par endpoint
    if (endpoint) {
      this.stats.byEndpoint[endpoint] = (this.stats.byEndpoint[endpoint] || 0) + 1;
    }

    // Par minute
    this.stats.byMinute[currentMinute] = (this.stats.byMinute[currentMinute] || 0) + 1;

    // Par heure
    this.stats.byHour[currentHour] = (this.stats.byHour[currentHour] || 0) + 1;

    // Nettoyer les anciennes entrées (garder 24h de données)
    this.cleanupOldEntries();

    // Vérifier les seuils d'alerte
    const alerts = this.checkAlerts();

    // Notifier les abonnés
    this.subscribers.forEach(callback => callback(this.getStats(), alerts));
  }

  /**
   * Nettoyer les anciennes entrées
   */
  private cleanupOldEntries(): void {
    const nowMinute = Math.floor(Date.now() / 60000);
    const nowHour = Math.floor(Date.now() / 3600000);

    // Garder les données des 60 dernières minutes
    Object.keys(this.stats.byMinute).forEach(minuteStr => {
      const minute = parseInt(minuteStr, 10);
      if (nowMinute - minute > 60) {
        delete this.stats.byMinute[minute];
      }
    });

    // Garder les données des 24 dernières heures
    Object.keys(this.stats.byHour).forEach(hourStr => {
      const hour = parseInt(hourStr, 10);
      if (nowHour - hour > 24) {
        delete this.stats.byHour[hour];
      }
    });
  }

  /**
   * Vérifier les seuils d'alerte
   */
  private checkAlerts(): string[] {
    const alerts: string[] = [];
    const currentMinute = Math.floor(Date.now() / 60000);
    const currentHour = Math.floor(Date.now() / 3600000);

    // Vérifier le taux d'erreur par minute
    const errorRatePerMinute = this.stats.byMinute[currentMinute] || 0;
    if (errorRatePerMinute >= this.thresholds.errorRatePerMinute) {
      alerts.push(`Taux d'erreur élevé: ${errorRatePerMinute} erreurs dans la dernière minute`);
    }

    // Vérifier le taux d'erreur par heure
    const errorRatePerHour = this.stats.byHour[currentHour] || 0;
    if (errorRatePerHour >= this.thresholds.errorRatePerHour) {
      alerts.push(`Taux d'erreur élevé: ${errorRatePerHour} erreurs dans la dernière heure`);
    }

    // Vérifier les seuils par type d'erreur
    Object.entries(this.thresholds.byErrorType).forEach(([type, threshold]) => {
      const errorType = type as NotionErrorType;
      const count = this.stats.byType[errorType] || 0;
      if (count >= threshold) {
        alerts.push(`Seuil d'erreur dépassé pour ${errorType}: ${count} erreurs`);
      }
    });

    // Mettre à jour le cache d'alertes
    this.alertCache = alerts;

    return alerts;
  }

  /**
   * Réinitialiser les statistiques
   */
  resetStats(): void {
    this.stats = {
      total: 0,
      byType: {},
      byEndpoint: {},
      byMinute: {},
      byHour: {},
      lastUpdated: null
    };
    this.alertCache = [];
    
    // Notifier les abonnés
    this.subscribers.forEach(callback => callback(this.getStats(), []));
  }
}

// Créer et exporter une instance singleton
export const errorCounter = new ErrorCounter();
