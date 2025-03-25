
import { useState, useEffect, useCallback } from 'react';
import { LogLevel } from '@/services/notion/errorHandling/types';

// Définition du type StructuredLog pour éviter l'import manquant
export interface StructuredLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  context?: Record<string, any>;
  tags?: string[];
}

/**
 * Interface pour le logger structuré
 */
interface StructuredLogger {
  log: (level: LogLevel, message: string, data?: any, context?: Record<string, any>) => void;
  debug: (message: string, data?: any, context?: Record<string, any>) => void;
  info: (message: string, data?: any, context?: Record<string, any>) => void;
  warn: (message: string, data?: any, context?: Record<string, any>) => void;
  error: (message: string, data?: any, context?: Record<string, any>) => void;
  trace: (message: string, data?: any, context?: Record<string, any>) => void;
  fatal: (message: string, data?: any, context?: Record<string, any>) => void;
  getRecentLogs: (count?: number) => StructuredLog[];
  subscribe: (callback: (logs: StructuredLog[]) => void) => () => void;
  setMinLevel: (level: LogLevel) => void;
  getMinLevel: () => LogLevel;
}

// Référence au logger structuré global, si disponible
let structuredLogger: any;

try {
  structuredLogger = require('@/services/notion/logging/structuredLogger').structuredLogger;
} catch (e) {
  console.warn('Module structuredLogger non disponible');
  // Créer un logger de secours
  structuredLogger = {
    log: (level: LogLevel, message: string) => console.log(`[${level}]`, message),
    debug: (message: string) => console.debug(message),
    info: (message: string) => console.info(message),
    warn: (message: string) => console.warn(message),
    error: (message: string) => console.error(message),
    trace: (message: string) => console.debug(`[TRACE] ${message}`),
    fatal: (message: string) => console.error(`[FATAL] ${message}`),
    getRecentLogs: () => [],
    subscribe: () => () => {},
    setMinLevel: () => {},
    getMinLevel: () => LogLevel.INFO
  };
}

/**
 * Hook pour utiliser le logger structuré
 */
export function useStructuredLogger() {
  const [logs, setLogs] = useState<StructuredLog[]>([]);
  
  useEffect(() => {
    // S'abonner aux logs
    const unsubscribe = structuredLogger.subscribe((newLogs: StructuredLog[]) => {
      setLogs(newLogs);
    });
    
    // Charger les logs initiaux
    setLogs(structuredLogger.getRecentLogs());
    
    return unsubscribe;
  }, []);
  
  return {
    logs,
    logger: structuredLogger,
    clearLogs: useCallback(() => setLogs([]), [])
  };
}
