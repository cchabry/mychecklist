
import { 
  ErrorCounterOptions, 
  ErrorCounterStats, 
  AlertThresholdConfig, 
  NotionErrorType
} from '../errorHandling/types';

/**
 * Format des erreurs pour méthode toString
 */
const ERROR_FORMAT: Record<NotionErrorType, string> = {
  [NotionErrorType.UNKNOWN]: 'Erreur inconnue',
  [NotionErrorType.NETWORK]: 'Erreur réseau',
  [NotionErrorType.TIMEOUT]: 'Délai dépassé',
  [NotionErrorType.AUTH]: 'Erreur d\'authentification',
  [NotionErrorType.RATE_LIMIT]: 'Limitation de débit',
  [NotionErrorType.SERVER]: 'Erreur serveur',
  [NotionErrorType.CLIENT]: 'Erreur client',
  [NotionErrorType.VALIDATION]: 'Erreur de validation',
  [NotionErrorType.NOT_FOUND]: 'Ressource non trouvée',
  [NotionErrorType.FORBIDDEN]: 'Accès interdit',
  [NotionErrorType.API]: 'Erreur API'
};

/**
 * Service de comptage des erreurs
 * Ce service permet de suivre les erreurs survenues dans l'application
 */
class ErrorCounter {
  private options: ErrorCounterOptions;
  private stats: ErrorCounterStats;
  private subscribers: Array<(stats: ErrorCounterStats, alerts: string[]) => void>;
  private thresholds: AlertThresholdConfig;
  private currentAlerts: string[];
  private lastCleanup: number;
  
  constructor(options: ErrorCounterOptions = {}) {
    this.options = {
      maxStorageTime: 24 * 60 * 60 * 1000, // 24 heures par défaut
      cleanupInterval: 60 * 60 * 1000, // 1 heure par défaut
      ...options
    };
    
    this.stats = {
      total: 0,
      byType: {},
      byEndpoint: {},
      byHour: {},
      byMinute: {}
    };
    
    this.subscribers = [];
    this.thresholds = {
      totalErrorsPerHour: 100,
      totalErrorsPerMinute: 20,
      apiErrorsPerHour: 50,
      networkErrorsPerMinute: 5,
      authErrorsPerHour: 10
    };
    this.currentAlerts = [];
    this.lastCleanup = Date.now();
    
    // Nettoyage automatique des anciennes statistiques
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupOldStats(), this.options.cleanupInterval || 3600000);
    }
  }
  
  /**
   * Configure le compteur d'erreurs
   */
  public configure(options: ErrorCounterOptions): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * Configure les seuils d'alerte
   */
  public configureThresholds(thresholds: AlertThresholdConfig): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    this.checkThresholds();
  }
  
  /**
   * Enregistre une erreur
   */
  public recordError(error: Error, endpoint?: string): void {
    // Déterminer le type d'erreur
    const errorType = this.classifyError(error);
    
    // Incrémenter le compteur total
    this.stats.total = (this.stats.total || 0) + 1;
    
    // Incrémenter le compteur par type
    if (!this.stats.byType) this.stats.byType = {};
    this.stats.byType[errorType] = (this.stats.byType[errorType] || 0) + 1;
    
    // Incrémenter le compteur par endpoint si fourni
    if (endpoint) {
      if (!this.stats.byEndpoint) this.stats.byEndpoint = {};
      this.stats.byEndpoint[endpoint] = (this.stats.byEndpoint[endpoint] || 0) + 1;
    }
    
    // Incrémenter les compteurs temporels
    const now = Date.now();
    const currentHour = Math.floor(now / 3600000);
    const currentMinute = Math.floor(now / 60000);
    
    if (!this.stats.byHour) this.stats.byHour = {};
    if (!this.stats.byMinute) this.stats.byMinute = {};
    
    this.stats.byHour[currentHour] = (this.stats.byHour[currentHour] || 0) + 1;
    this.stats.byMinute[currentMinute] = (this.stats.byMinute[currentMinute] || 0) + 1;
    
    // Vérifier si des seuils sont dépassés
    this.checkThresholds();
    
    // Nettoyer les anciennes stats si nécessaire
    if (now - this.lastCleanup > (this.options.cleanupInterval || 3600000)) {
      this.cleanupOldStats();
      this.lastCleanup = now;
    }
    
    // Notifier les abonnés
    this.notifySubscribers();
  }
  
  /**
   * Réinitialise les statistiques
   */
  public resetStats(): void {
    this.stats = {
      total: 0,
      byType: {},
      byEndpoint: {},
      byHour: {},
      byMinute: {}
    };
    this.currentAlerts = [];
    this.notifySubscribers();
  }
  
  /**
   * Obtient les statistiques actuelles
   */
  public getStats(): ErrorCounterStats {
    return this.stats;
  }
  
  /**
   * Obtient les alertes actuelles
   */
  public getAlerts(): string[] {
    return [...this.currentAlerts];
  }
  
  /**
   * S'abonne aux mises à jour des statistiques
   */
  public subscribe(callback: (stats: ErrorCounterStats, alerts: string[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Déclencher immédiatement avec l'état actuel
    callback(this.stats, this.currentAlerts);
    
    // Renvoyer une fonction de désabonnement
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  /**
   * Classification des erreurs par type
   */
  private classifyError(error: Error): NotionErrorType {
    const errorMessage = error.message.toLowerCase();
    
    // Cas spécifiques
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || 
        errorMessage.includes('cors') || errorMessage.includes('connection')) {
      return NotionErrorType.NETWORK;
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || 
        errorMessage.includes('token') || errorMessage.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests') || 
        errorMessage.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (errorMessage.includes('server') || errorMessage.includes('5') || 
        errorMessage.includes('503') || errorMessage.includes('500')) {
      return NotionErrorType.SERVER;
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      return NotionErrorType.FORBIDDEN;
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || 
        errorMessage.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (errorMessage.includes('api') || errorMessage.includes('endpoint')) {
      return NotionErrorType.API;
    }
    
    // Par défaut
    return NotionErrorType.UNKNOWN;
  }
  
  /**
   * Nettoie les statistiques anciennes
   */
  private cleanupOldStats(): void {
    const now = Date.now();
    const oldestTimeToKeep = now - (this.options.maxStorageTime || 86400000);
    const oldestHourToKeep = Math.floor(oldestTimeToKeep / 3600000);
    const oldestMinuteToKeep = Math.floor(oldestTimeToKeep / 60000);
    
    // Nettoyer les heures
    if (this.stats.byHour) {
      Object.keys(this.stats.byHour).forEach(hourStr => {
        const hour = parseInt(hourStr, 10);
        if (hour < oldestHourToKeep) {
          delete this.stats.byHour[hour];
        }
      });
    }
    
    // Nettoyer les minutes
    if (this.stats.byMinute) {
      Object.keys(this.stats.byMinute).forEach(minuteStr => {
        const minute = parseInt(minuteStr, 10);
        if (minute < oldestMinuteToKeep) {
          delete this.stats.byMinute[minute];
        }
      });
    }
  }
  
  /**
   * Vérifie si des seuils d'alerte sont dépassés
   */
  private checkThresholds(): void {
    const now = Date.now();
    const currentHour = Math.floor(now / 3600000);
    const currentMinute = Math.floor(now / 60000);
    
    const newAlerts: string[] = [];
    
    // Vérifier le seuil d'erreurs total par heure
    const totalErrorsThisHour = this.stats.byHour?.[currentHour] || 0;
    if (totalErrorsThisHour >= this.thresholds.totalErrorsPerHour) {
      newAlerts.push(`Le nombre total d'erreurs par heure (${totalErrorsThisHour}) a dépassé le seuil (${this.thresholds.totalErrorsPerHour})`);
    }
    
    // Vérifier le seuil d'erreurs total par minute
    const totalErrorsThisMinute = this.stats.byMinute?.[currentMinute] || 0;
    if (totalErrorsThisMinute >= this.thresholds.totalErrorsPerMinute) {
      newAlerts.push(`Le nombre total d'erreurs par minute (${totalErrorsThisMinute}) a dépassé le seuil (${this.thresholds.totalErrorsPerMinute})`);
    }
    
    // Mettre à jour les alertes si changées
    if (JSON.stringify(newAlerts) !== JSON.stringify(this.currentAlerts)) {
      this.currentAlerts = newAlerts;
      this.notifySubscribers();
    }
  }
  
  /**
   * Notifie tous les abonnés des changements
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.stats, this.currentAlerts);
      } catch (error) {
        console.error('Erreur lors de la notification d\'un abonné:', error);
      }
    });
  }
  
  /**
   * Convertit un type d'erreur en chaîne formatée
   */
  public formatErrorType(type: NotionErrorType): string {
    return ERROR_FORMAT[type] || ERROR_FORMAT[NotionErrorType.UNKNOWN];
  }
}

// Instance singleton
export const errorCounter = new ErrorCounter();

export default errorCounter;
