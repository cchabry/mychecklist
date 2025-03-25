
import { NotionErrorType } from '../errorHandling/types';

/**
 * Interface pour les statistiques de compteurs d'erreurs
 */
export interface ErrorCounterStats {
  // Compteurs par type d'erreur
  byType: Record<NotionErrorType, number>;
  
  // Compteur total d'erreurs
  total: number;
  
  // Taux d'erreur (erreurs / tentatives)
  errorRate: number;
  
  // Nombre de tentatives d'opérations
  attempts: number;
  
  // Date de dernière mise à jour
  lastUpdated: number;
}

/**
 * Classe pour suivre les compteurs d'erreurs
 */
class ErrorCounter {
  private counters: Record<NotionErrorType, number> = Object.values(NotionErrorType).reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<NotionErrorType, number>);
  
  private totalErrors = 0;
  private totalAttempts = 0;
  private lastReset = Date.now();
  private lastUpdated = Date.now();
  
  /**
   * Incrémente le compteur pour un type d'erreur spécifique
   */
  increment(errorOrType: Error | NotionErrorType): void {
    // Déterminer le type d'erreur
    let errorType: NotionErrorType;
    
    if (typeof errorOrType === 'string' && Object.values(NotionErrorType).includes(errorOrType as NotionErrorType)) {
      // C'est déjà un type d'erreur
      errorType = errorOrType as NotionErrorType;
    } else if (errorOrType instanceof Error) {
      // C'est une erreur, déterminer son type
      errorType = this.detectErrorType(errorOrType);
    } else {
      // Type inconnu, utiliser UNKNOWN
      errorType = NotionErrorType.UNKNOWN;
    }
    
    // Incrémenter le compteur spécifique
    this.counters[errorType] = (this.counters[errorType] || 0) + 1;
    
    // Incrémenter le total
    this.totalErrors++;
    
    // Mettre à jour le timestamp
    this.lastUpdated = Date.now();
  }
  
  /**
   * Enregistre une tentative d'opération (réussie ou non)
   */
  recordAttempt(): void {
    this.totalAttempts++;
    this.lastUpdated = Date.now();
  }
  
  /**
   * Réinitialise tous les compteurs
   */
  reset(): void {
    // Réinitialiser tous les compteurs par type
    Object.values(NotionErrorType).forEach(type => {
      this.counters[type] = 0;
    });
    
    // Réinitialiser les totaux
    this.totalErrors = 0;
    this.totalAttempts = 0;
    
    // Mettre à jour les timestamps
    this.lastReset = Date.now();
    this.lastUpdated = Date.now();
  }
  
  /**
   * Récupère toutes les statistiques actuelles
   */
  getStats(): ErrorCounterStats {
    return {
      byType: { ...this.counters },
      total: this.totalErrors,
      attempts: this.totalAttempts,
      errorRate: this.calculateErrorRate(),
      lastUpdated: this.lastUpdated
    };
  }
  
  /**
   * Calcule le taux d'erreur actuel
   */
  calculateErrorRate(): number {
    if (this.totalAttempts === 0) return 0;
    return this.totalErrors / this.totalAttempts;
  }
  
  /**
   * Récupère le nombre d'erreurs d'un type spécifique
   */
  getCount(errorType: NotionErrorType): number {
    return this.counters[errorType] || 0;
  }
  
  /**
   * Récupère le nombre total d'erreurs
   */
  getTotalErrors(): number {
    return this.totalErrors;
  }
  
  /**
   * Obtient l'ancienneté des statistiques en millisecondes
   */
  getStatsAge(): number {
    return Date.now() - this.lastReset;
  }
  
  /**
   * Détecte le type d'erreur à partir d'une instance Error
   */
  private detectErrorType(error: Error): NotionErrorType {
    // Vérifier si l'erreur a déjà un type Notion
    if ('type' in error && typeof (error as any).type === 'string') {
      const type = (error as any).type;
      if (Object.values(NotionErrorType).includes(type)) {
        return type;
      }
    }
    
    // Sinon, essayer de détecter à partir du message
    const message = error.message.toLowerCase();
    
    if (message.includes('unauthorized') || message.includes('auth') || message.includes('token')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('permission') || message.includes('access denied')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('cors') || message.includes('origin')) {
      return NotionErrorType.CORS;
    }
    
    if (message.includes('database') || message.includes('query')) {
      return NotionErrorType.DATABASE;
    }
    
    if (message.includes('timeout')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (message.includes('format') || message.includes('parsing') || message.includes('invalid')) {
      return NotionErrorType.FORMAT;
    }
    
    // Par défaut, considérer comme une erreur API générique
    return NotionErrorType.API;
  }
}

// Exporter une instance singleton
export const errorCounter = new ErrorCounter();

// Export par défaut
export default errorCounter;
