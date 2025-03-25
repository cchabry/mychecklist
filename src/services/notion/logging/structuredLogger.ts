
import { v4 as uuidv4 } from 'uuid';
import { 
  StructuredLog, 
  LogLevel 
} from '../types/unified';

/**
 * Logger structuré pour l'écosystème Notion
 */
class StructuredLogger {
  private static instance: StructuredLogger;
  private logs: StructuredLog[] = [];
  private subscribers: Array<(logs: StructuredLog[]) => void> = [];
  private maxLogs: number = 1000;
  private minLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  /**
   * Obtenir l'instance unique du logger
   */
  public static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Log générique avec niveau spécifié
   */
  public log(level: LogLevel, message: string, data?: any, context?: Record<string, any>): void {
    // Vérifier le niveau minimum de log
    if (this.isLevelEnabled(level)) {
      const timestamp = Date.now();
      const source = context?.source || 'app';
      const tags = context?.tags || [];
      
      // Créer l'objet de log
      const logEntry: StructuredLog = {
        id: uuidv4(),
        timestamp,
        level,
        message,
        data,
        source,
        context: context || {},
        tags
      };
      
      // Ajouter le log
      this.addLog(logEntry);
      
      // Afficher dans la console
      this.printToConsole(logEntry);
    }
  }

  /**
   * Log de niveau TRACE
   */
  public trace(message: string, data?: any, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, data, context);
  }

  /**
   * Log de niveau DEBUG
   */
  public debug(message: string, data?: any, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Log de niveau INFO
   */
  public info(message: string, data?: any, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log de niveau WARN
   */
  public warn(message: string, data?: any, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log de niveau ERROR
   */
  public error(message: string, data?: any, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * Log de niveau FATAL
   */
  public fatal(message: string, data?: any, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, data, context);
  }

  /**
   * Obtenir les logs récents
   */
  public getRecentLogs(count: number = 100): StructuredLog[] {
    return this.logs.slice(0, Math.min(count, this.logs.length));
  }

  /**
   * S'abonner aux logs
   */
  public subscribe(callback: (logs: StructuredLog[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Notifier immédiatement avec les logs actuels
    callback([...this.logs]);
    
    // Retourner une fonction de désabonnement
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Définir le niveau minimum de log
   */
  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Obtenir le niveau minimum de log
   */
  public getMinLevel(): LogLevel {
    return this.minLevel;
  }

  /**
   * Vérifier si un niveau de log est activé
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = [
      LogLevel.TRACE,
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL
    ];
    
    const minLevelIndex = levels.indexOf(this.minLevel);
    const logLevelIndex = levels.indexOf(level);
    
    return logLevelIndex >= minLevelIndex;
  }

  /**
   * Ajouter un log à la liste et notifier les abonnés
   */
  private addLog(log: StructuredLog): void {
    // Ajouter au début pour avoir les plus récents en premier
    this.logs.unshift(log);
    
    // Limiter le nombre de logs stockés
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Notifier les abonnés
    this.notifySubscribers();
  }

  /**
   * Notifier les abonnés
   */
  private notifySubscribers(): void {
    const logsCopy = [...this.logs];
    
    this.subscribers.forEach(callback => {
      try {
        callback(logsCopy);
      } catch (error) {
        console.error('Erreur lors de la notification d\'un abonné aux logs:', error);
      }
    });
  }

  /**
   * Afficher un log dans la console
   */
  private printToConsole(log: StructuredLog): void {
    const timestamp = new Date(log.timestamp).toISOString();
    const prefix = `${timestamp} [${log.level.toUpperCase()}] ${log.source}:`;
    
    switch (log.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(prefix, log.message, log.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, log.message, log.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, log.message, log.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, log.message, log.data || '');
        // Afficher l'erreur complète si disponible
        if (log.data instanceof Error) {
          console.error(log.data);
        }
        break;
    }
  }
}

// Exporter une instance singleton
export const structuredLogger = StructuredLogger.getInstance();
