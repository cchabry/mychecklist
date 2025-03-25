
import { StructuredLog, LogLevel, LoggerConfig } from '@/services/notion/errorHandling/types';

/**
 * Logger structuré pour les événements Notion
 */
class StructuredLogger {
  private logs: StructuredLog[] = [];
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    consoleOutput: true,
    jsonOutput: false,
    maxLogsToKeep: 1000,
  };
  private subscribers: ((log: StructuredLog) => void)[] = [];

  /**
   * Configure les options du logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * S'abonner aux nouveaux logs
   */
  subscribe(callback: (log: StructuredLog) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Récupérer les logs récents
   */
  getRecentLogs(): StructuredLog[] {
    return [...this.logs];
  }

  /**
   * Effacer tous les logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Créer un log et le diffuser
   */
  private createLog(
    level: LogLevel,
    message: string,
    contextOrError?: Record<string, any> | Error,
    options?: {
      source?: string;
      tags?: string[];
    }
  ): StructuredLog {
    // Extraire l'erreur et le contexte
    let error: Error | undefined;
    let context: Record<string, any> = {};

    if (contextOrError instanceof Error) {
      error = contextOrError;
      // Si des options contiennent un contexte, l'utiliser
      if (options && options.hasOwnProperty('context')) {
        context = (options as any).context || {};
      }
    } else if (contextOrError && typeof contextOrError === 'object') {
      context = contextOrError;
    }

    // Créer l'objet de log
    const log: StructuredLog = {
      level,
      message,
      timestamp: Date.now(),
      context,
      source: options?.source || 'notion',
      tags: options?.tags || [],
    };

    // Ajouter l'erreur si présente
    if (error) {
      log.error = {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    // Ajouter le log à l'historique
    this.logs.push(log);
    
    // Limiter le nombre de logs stockés
    if (this.logs.length > this.config.maxLogsToKeep) {
      this.logs.shift();
    }

    // Notifier les abonnés
    this.subscribers.forEach(callback => callback(log));

    // Afficher dans la console si configuré
    this.outputToConsole(log);

    return log;
  }

  /**
   * Afficher un log dans la console
   */
  private outputToConsole(log: StructuredLog): void {
    if (!this.config.consoleOutput) return;
    
    // Ne pas logger si le niveau est inférieur au niveau configuré
    if (log.level < this.config.level) return;

    const formattedTime = new Date(log.timestamp).toISOString();
    
    // Récupérer la méthode de log appropriée
    let consoleMethod: keyof Console;
    switch (log.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        consoleMethod = 'debug';
        break;
      case LogLevel.INFO:
        consoleMethod = 'info';
        break;
      case LogLevel.WARN:
        consoleMethod = 'warn';
        break;
      case LogLevel.ERROR:
        consoleMethod = 'error';
        break;
      case LogLevel.FATAL:
        consoleMethod = 'error';
        break;
      default:
        consoleMethod = 'log';
    }

    // Formater le message
    const prefix = `[${formattedTime}] [${LogLevel[log.level]}] [${log.source}]`;
    
    // Si format JSON est activé
    if (this.config.jsonOutput) {
      console[consoleMethod](JSON.stringify(log));
    } else {
      // Utiliser un format plus lisible
      if (log.error) {
        console[consoleMethod](`${prefix} ${log.message}`, log.error, log.context);
      } else if (Object.keys(log.context).length > 0) {
        console[consoleMethod](`${prefix} ${log.message}`, log.context);
      } else {
        console[consoleMethod](`${prefix} ${log.message}`);
      }
    }
  }

  /**
   * Log de niveau trace
   */
  trace(message: string, context?: Record<string, any>, options?: { source?: string; tags?: string[] }): StructuredLog {
    return this.createLog(LogLevel.TRACE, message, context, options);
  }

  /**
   * Log de niveau debug
   */
  debug(message: string, context?: Record<string, any>, options?: { source?: string; tags?: string[] }): StructuredLog {
    return this.createLog(LogLevel.DEBUG, message, context, options);
  }

  /**
   * Log de niveau info
   */
  info(message: string, context?: Record<string, any>, options?: { source?: string; tags?: string[] }): StructuredLog {
    return this.createLog(LogLevel.INFO, message, context, options);
  }

  /**
   * Log de niveau warn
   */
  warn(message: string, context?: Record<string, any>, options?: { source?: string; tags?: string[] }): StructuredLog {
    return this.createLog(LogLevel.WARN, message, context, options);
  }

  /**
   * Log de niveau error
   */
  error(
    message: string,
    errorOrContext?: Error | Record<string, any>,
    options?: {
      context?: Record<string, any>;
      source?: string;
      tags?: string[];
    }
  ): StructuredLog {
    return this.createLog(LogLevel.ERROR, message, errorOrContext, options);
  }

  /**
   * Log de niveau fatal
   */
  fatal(
    message: string,
    errorOrContext?: Error | Record<string, any>,
    options?: {
      context?: Record<string, any>;
      source?: string;
      tags?: string[];
    }
  ): StructuredLog {
    return this.createLog(LogLevel.FATAL, message, errorOrContext, options);
  }
}

// Créer et exporter une instance singleton
export const structuredLogger = new StructuredLogger();
