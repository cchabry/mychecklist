
import { StructuredLog, LogLevel, NotionErrorType } from '@/services/notion/errorHandling/types';

/**
 * Service pour les logs structurés
 */
export class StructuredLogger {
  private static instance: StructuredLogger;
  private logs: StructuredLog[] = [];
  private subscribers: Array<(log: StructuredLog) => void> = [];
  private logLevel: LogLevel = LogLevel.INFO;
  private maxLogs: number = 1000;
  private consoleOutput: boolean = true;
  private jsonOutput: boolean = false;
  
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
   * Configurer le logger
   */
  public configure(options: {
    level?: LogLevel;
    maxLogs?: number;
    consoleOutput?: boolean;
    jsonOutput?: boolean;
  }): void {
    if (options.level !== undefined) this.logLevel = options.level;
    if (options.maxLogs !== undefined) this.maxLogs = options.maxLogs;
    if (options.consoleOutput !== undefined) this.consoleOutput = options.consoleOutput;
    if (options.jsonOutput !== undefined) this.jsonOutput = options.jsonOutput;
  }
  
  /**
   * Créer et enregistrer un log
   */
  private log(level: LogLevel, message: string, options: {
    context?: Record<string, any>;
    error?: Error;
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    // Vérifier si le niveau est suffisant pour être enregistré
    if (this.shouldLog(level)) {
      const structuredLog: StructuredLog = {
        timestamp: Date.now(),
        level,
        message,
        context: options.context,
        source: options.source,
        tags: options.tags
      };
      
      // Ajouter les détails d'erreur si présente
      if (options.error) {
        structuredLog.error = {
          message: options.error.message,
          stack: options.error.stack
        };
        
        // Déterminer le type d'erreur si c'est une NotionError
        if ('type' in options.error) {
          structuredLog.error.type = (options.error as any).type;
        } else {
          // Détection simplifiée du type d'erreur
          const lowerMsg = options.error.message.toLowerCase();
          if (lowerMsg.includes('auth') || lowerMsg.includes('token')) {
            structuredLog.error.type = NotionErrorType.AUTH;
          } else if (lowerMsg.includes('permission')) {
            structuredLog.error.type = NotionErrorType.PERMISSION;
          } else if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) {
            structuredLog.error.type = NotionErrorType.NETWORK;
          }
        }
      }
      
      // Enregistrer le log
      this.logs.push(structuredLog);
      
      // Limiter le nombre de logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      
      // Afficher dans la console si activé
      if (this.consoleOutput) {
        this.outputToConsole(structuredLog);
      }
      
      // Notifier les abonnés
      this.notifySubscribers(structuredLog);
      
      return structuredLog;
    }
    
    // Créer un log factice si le niveau n'est pas suffisant
    return {
      timestamp: Date.now(),
      level,
      message: message
    };
  }
  
  /**
   * Déterminer si un niveau de log doit être enregistré
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.TRACE,
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL
    ];
    
    const configuredIndex = levels.indexOf(this.logLevel);
    const currentIndex = levels.indexOf(level);
    
    return currentIndex >= configuredIndex;
  }
  
  /**
   * Afficher un log dans la console
   */
  private outputToConsole(log: StructuredLog): void {
    const timestamp = new Date(log.timestamp).toISOString();
    
    if (this.jsonOutput) {
      // Format JSON
      console.log(JSON.stringify(log));
      return;
    }
    
    // Format lisible avec couleurs
    const logPrefix = `[${timestamp}] [${log.level.toUpperCase()}]`;
    const source = log.source ? ` [${log.source}]` : '';
    
    switch (log.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(`${logPrefix}${source} ${log.message}`, log.context || '');
        break;
      case LogLevel.INFO:
        console.info(`${logPrefix}${source} ${log.message}`, log.context || '');
        break;
      case LogLevel.WARN:
        console.warn(`${logPrefix}${source} ${log.message}`, log.context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${logPrefix}${source} ${log.message}`, log.context || '');
        if (log.error?.stack) {
          console.error(log.error.stack);
        }
        break;
    }
  }
  
  /**
   * Notifier les abonnés d'un nouveau log
   */
  private notifySubscribers(log: StructuredLog): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(log);
      } catch (err) {
        console.error('Erreur lors de la notification d\'un abonné aux logs:', err);
      }
    });
  }
  
  /**
   * S'abonner aux logs
   */
  public subscribe(callback: (log: StructuredLog) => void): () => void {
    this.subscribers.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }
  
  /**
   * Log de niveau TRACE
   */
  public trace(message: string, context?: Record<string, any>, options: {
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    return this.log(LogLevel.TRACE, message, {
      context,
      source: options.source,
      tags: options.tags
    });
  }
  
  /**
   * Log de niveau DEBUG
   */
  public debug(message: string, context?: Record<string, any>, options: {
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    return this.log(LogLevel.DEBUG, message, {
      context,
      source: options.source,
      tags: options.tags
    });
  }
  
  /**
   * Log de niveau INFO
   */
  public info(message: string, context?: Record<string, any>, options: {
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    return this.log(LogLevel.INFO, message, {
      context,
      source: options.source,
      tags: options.tags
    });
  }
  
  /**
   * Log de niveau WARN
   */
  public warn(message: string, context?: Record<string, any>, options: {
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    return this.log(LogLevel.WARN, message, {
      context,
      source: options.source,
      tags: options.tags
    });
  }
  
  /**
   * Log de niveau ERROR
   */
  public error(message: string, errorOrContext?: Error | Record<string, any>, options: {
    context?: Record<string, any>;
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    const error = errorOrContext instanceof Error ? errorOrContext : undefined;
    const context = errorOrContext instanceof Error ? options.context : errorOrContext;
    
    return this.log(LogLevel.ERROR, message, {
      error,
      context,
      source: options.source,
      tags: options.tags
    });
  }
  
  /**
   * Log de niveau FATAL
   */
  public fatal(message: string, errorOrContext?: Error | Record<string, any>, options: {
    context?: Record<string, any>;
    source?: string;
    tags?: string[];
  } = {}): StructuredLog {
    const error = errorOrContext instanceof Error ? errorOrContext : undefined;
    const context = errorOrContext instanceof Error ? options.context : errorOrContext;
    
    return this.log(LogLevel.FATAL, message, {
      error,
      context,
      source: options.source,
      tags: options.tags
    });
  }
  
  /**
   * Obtenir tous les logs
   */
  public getLogs(): StructuredLog[] {
    return [...this.logs];
  }
  
  /**
   * Obtenir les logs les plus récents
   */
  public getRecentLogs(count: number = 100): StructuredLog[] {
    return this.logs.slice(-count);
  }
  
  /**
   * Effacer tous les logs
   */
  public clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Filtrer les logs
   */
  public filterLogs(options: {
    level?: LogLevel;
    source?: string;
    tags?: string[];
    hasError?: boolean;
    fromTimestamp?: number;
    toTimestamp?: number;
    messageContains?: string;
  }): StructuredLog[] {
    return this.logs.filter(log => {
      if (options.level && log.level !== options.level) return false;
      if (options.source && log.source !== options.source) return false;
      if (options.tags && options.tags.length > 0) {
        if (!log.tags || !options.tags.some(tag => log.tags?.includes(tag))) return false;
      }
      if (options.hasError && !log.error) return false;
      if (options.fromTimestamp && log.timestamp < options.fromTimestamp) return false;
      if (options.toTimestamp && log.timestamp > options.toTimestamp) return false;
      if (options.messageContains && !log.message.includes(options.messageContains)) return false;
      
      return true;
    });
  }
}

// Exporter une instance unique
export const structuredLogger = StructuredLogger.getInstance();
