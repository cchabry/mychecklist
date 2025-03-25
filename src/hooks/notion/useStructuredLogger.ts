
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogLevel, StructuredLog, StructuredLogMessage } from '@/services/notion/types/unified';

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
    getMinLevel: () => LogLevel.INFO,
    exportLogs: () => JSON.stringify([])
  };
}

/**
 * Hook pour utiliser le logger structuré
 */
export function useStructuredLogger() {
  const [logs, setLogs] = useState<StructuredLog[]>([]);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  
  useEffect(() => {
    // S'abonner aux logs
    const unsubscribe = structuredLogger.subscribe((newLogs: StructuredLog[]) => {
      setLogs(newLogs);
    });
    
    // Charger les logs initiaux
    setLogs(structuredLogger.getRecentLogs());
    
    return unsubscribe;
  }, []);
  
  // Filtrer les logs selon les critères
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesText = filter ? 
        log.message.toLowerCase().includes(filter.toLowerCase()) || 
        (log.data && JSON.stringify(log.data).toLowerCase().includes(filter.toLowerCase())) : 
        true;
      
      const matchesLevel = levelFilter !== 'all' ? 
        log.level === levelFilter : 
        true;
      
      return matchesText && matchesLevel;
    });
  }, [logs, filter, levelFilter]);
  
  // Mettre à jour le filtre
  const updateFilter = useCallback((value: string) => {
    setFilter(value);
  }, []);
  
  // Effacer le filtre
  const clearFilter = useCallback(() => {
    setFilter('');
    setLevelFilter('all');
  }, []);
  
  // Effacer les logs
  const clearLogs = useCallback(() => {
    structuredLogger.clear();
  }, []);
  
  // Exposer des méthodes helpers pour logging
  const info = useCallback((message: string, data?: any, context?: Record<string, any>) => {
    structuredLogger.info(message, data, context);
  }, []);
  
  const error = useCallback((message: string, data?: any, context?: Record<string, any>) => {
    structuredLogger.error(message, data, context);
  }, []);
  
  // Exporter les logs
  const exportLogs = useCallback(() => {
    if (typeof structuredLogger.exportLogs === 'function') {
      return structuredLogger.exportLogs();
    }
    return JSON.stringify(logs);
  }, [logs]);
  
  return {
    logs: filteredLogs,
    logger: structuredLogger,
    clearLogs,
    filteredLogs,
    updateFilter,
    clearFilter,
    filter,
    levelFilter,
    setLevelFilter,
    info,
    error,
    exportLogs
  };
}
