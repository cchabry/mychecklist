
import { LogLevel, StructuredLogMessage, StructuredLogger, StructuredLoggerOptions } from '../types/unified';

/**
 * Configuration par défaut du logger
 */
const DEFAULT_CONFIG: StructuredLoggerOptions = {
  minLevel: LogLevel.INFO,
  maxLogs: 200,
  persistLogs: false,
  formatters: {}
};

/**
 * Message de log structuré
 */
class StructuredLogEntry implements StructuredLogMessage {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  context?: Record<string, any>;
  source?: string;
  
  constructor(level: LogLevel, message: string, data?: any, context?: Record<string, any>) {
    this.timestamp = new Date();
    this.level = level;
    this.message = message;
    this.data = data;
    this.context = context;
    
    // Essayer de détecter la source
    if (context && typeof context.source === 'string') {
      this.source = context.source;
    }
  }
}

/**
 * Configuration actuelle
 */
let config: StructuredLoggerOptions = { ...DEFAULT_CONFIG };

/**
 * Messages stockés en mémoire
 */
let messages: StructuredLogMessage[] = [];

/**
 * Liste des abonnés aux changements de logs
 */
const subscribers: ((messages: StructuredLogMessage[]) => void)[] = [];

/**
 * Clé de stockage local
 */
const STORAGE_KEY = 'structured_logs';

/**
 * Charge les logs du stockage local
 */
const loadLogsFromStorage = (): StructuredLogMessage[] => {
  if (!config.persistLogs) return [];
  
  try {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    if (storedLogs) {
      const parsedLogs = JSON.parse(storedLogs);
      
      // Convertir les timestamps en objets Date
      return parsedLogs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des logs:', error);
  }
  
  return [];
};

/**
 * Sauvegarde les logs dans le stockage local
 */
const saveLogsToStorage = (): void => {
  if (!config.persistLogs) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des logs:', error);
  }
};

/**
 * Notifie les abonnés des changements
 */
const notifySubscribers = (): void => {
  subscribers.forEach(callback => {
    try {
      callback([...messages]);
    } catch (e) {
      console.error('Erreur dans un callback d\'abonné aux logs:', e);
    }
  });
};

/**
 * Ajoute un message de log
 */
const addLogMessage = (level: LogLevel, message: string, data?: any, context?: Record<string, any>): void => {
  // Vérifier le niveau de log minimum
  if (level < config.minLevel) return;
  
  // Créer l'entrée de log
  const entry = new StructuredLogEntry(level, message, data, context);
  
  // Ajouter à la liste des messages
  messages.unshift(entry);
  
  // Limiter le nombre de messages
  if (messages.length > config.maxLogs) {
    messages = messages.slice(0, config.maxLogs);
  }
  
  // Sauvegarder dans le stockage local si nécessaire
  if (config.persistLogs) {
    saveLogsToStorage();
  }
  
  // Notifier les abonnés
  notifySubscribers();
  
  // Journaliser dans la console également
  logToConsole(entry);
};

/**
 * Journalise dans la console
 */
const logToConsole = (entry: StructuredLogMessage): void => {
  const prefix = entry.source ? `[${entry.source}]` : '';
  const timestamp = entry.timestamp.toISOString();
  
  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(`${timestamp} ${prefix} ${entry.message}`, entry.data || '');
      break;
    case LogLevel.INFO:
      console.info(`${timestamp} ${prefix} ${entry.message}`, entry.data || '');
      break;
    case LogLevel.WARN:
      console.warn(`${timestamp} ${prefix} ${entry.message}`, entry.data || '');
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(`${timestamp} ${prefix} ${entry.message}`, entry.data || '');
      break;
  }
};

/**
 * Logger structuré
 */
export const structuredLogger: StructuredLogger = {
  /**
   * Configure le logger
   */
  configure(options: Partial<StructuredLoggerOptions>): void {
    config = {
      ...config,
      ...options
    };
    
    // Si on active la persistance, charger les logs
    if (options.persistLogs && !config.persistLogs) {
      const storedLogs = loadLogsFromStorage();
      if (storedLogs.length > 0) {
        messages = storedLogs.concat(messages).slice(0, config.maxLogs);
        notifySubscribers();
      }
    }
    
    // Journaliser la configuration
    this.debug('Logger structuré configuré', config, { source: 'StructuredLogger' });
  },
  
  /**
   * Définit le niveau de log minimum
   */
  setMinLevel(level: LogLevel): void {
    config.minLevel = level;
    this.debug(`Niveau de log minimum défini à ${LogLevel[level]}`, null, { source: 'StructuredLogger' });
  },
  
  /**
   * Ajoute un message de niveau DEBUG
   */
  debug(message: string, data?: any, context?: Record<string, any>): void {
    addLogMessage(LogLevel.DEBUG, message, data, context);
  },
  
  /**
   * Ajoute un message de niveau INFO
   */
  info(message: string, data?: any, context?: Record<string, any>): void {
    addLogMessage(LogLevel.INFO, message, data, context);
  },
  
  /**
   * Ajoute un message de niveau WARN
   */
  warn(message: string, data?: any, context?: Record<string, any>): void {
    addLogMessage(LogLevel.WARN, message, data, context);
  },
  
  /**
   * Ajoute un message de niveau ERROR
   */
  error(message: string, data?: any | Error, context?: Record<string, any>): void {
    // Si data est une Error, extraire les informations
    if (data instanceof Error) {
      const errorData = {
        name: data.name,
        message: data.message,
        stack: data.stack,
        ...(data as any) // Inclure d'autres propriétés personnalisées
      };
      
      addLogMessage(LogLevel.ERROR, message, errorData, context);
    } else {
      addLogMessage(LogLevel.ERROR, message, data, context);
    }
  },
  
  /**
   * Ajoute un message de niveau FATAL
   */
  fatal(message: string, data?: any | Error, context?: Record<string, any>): void {
    // Si data est une Error, extraire les informations
    if (data instanceof Error) {
      const errorData = {
        name: data.name,
        message: data.message,
        stack: data.stack,
        ...(data as any) // Inclure d'autres propriétés personnalisées
      };
      
      addLogMessage(LogLevel.FATAL, message, errorData, context);
    } else {
      addLogMessage(LogLevel.FATAL, message, data, context);
    }
  },
  
  /**
   * Récupère les messages filtrés par niveau
   */
  getMessages(level?: LogLevel): StructuredLogMessage[] {
    if (level === undefined) {
      return [...messages];
    }
    
    return messages.filter(msg => msg.level >= level);
  },
  
  /**
   * Efface tous les messages
   */
  clear(): void {
    messages = [];
    
    if (config.persistLogs) {
      saveLogsToStorage();
    }
    
    notifySubscribers();
    this.debug('Logs effacés', null, { source: 'StructuredLogger' });
  }
};

// Charger les logs existants au démarrage
if (config.persistLogs) {
  messages = loadLogsFromStorage();
}

// Ajouter la possibilité de s'abonner aux changements
(structuredLogger as any).subscribe = (callback: (messages: StructuredLogMessage[]) => void): (() => void) => {
  subscribers.push(callback);
  
  // Envoyer les messages actuels
  callback([...messages]);
  
  // Retourner une fonction pour se désabonner
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
};

// Ajouter la fonction d'exportation
(structuredLogger as any).export = (format: 'json' | 'csv' = 'json'): string => {
  if (format === 'csv') {
    // En-tête CSV
    let csv = 'Timestamp;Level;Source;Message;Data;Context\n';
    
    // Ajouter chaque ligne
    messages.forEach(msg => {
      const data = msg.data ? JSON.stringify(msg.data).replace(/"/g, '""') : '';
      const context = msg.context ? JSON.stringify(msg.context).replace(/"/g, '""') : '';
      
      csv += `"${msg.timestamp.toISOString()}";"${LogLevel[msg.level]}";"${msg.source || ''}";"${msg.message.replace(/"/g, '""')}";"${data}";"${context}"\n`;
    });
    
    return csv;
  }
  
  // Format JSON par défaut
  return JSON.stringify(messages, null, 2);
};
