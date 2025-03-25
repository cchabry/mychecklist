
import { useState, useEffect, useCallback } from 'react';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';
import { StructuredLog, LogLevel } from '@/services/notion/errorHandling/types';

/**
 * Hook pour utiliser le logger structuré
 */
export function useStructuredLogger() {
  const [logs, setLogs] = useState<StructuredLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StructuredLog[]>([]);
  const [filter, setFilter] = useState<{
    level?: LogLevel;
    source?: string;
    tags?: string[];
    hasError?: boolean;
    fromTimestamp?: number;
    toTimestamp?: number;
    messageContains?: string;
  }>({});
  
  // S'abonner aux nouveaux logs
  useEffect(() => {
    const unsubscribe = structuredLogger.subscribe((log) => {
      setLogs(prevLogs => [...prevLogs, log].slice(-1000)); // Garder les 1000 derniers logs
      
      // Appliquer le filtre au nouveau log
      const matchesFilter = applyFilter(log, filter);
      if (matchesFilter) {
        setFilteredLogs(prevFiltered => [...prevFiltered, log].slice(-1000));
      }
    });
    
    // Charger les logs existants
    setLogs(structuredLogger.getRecentLogs());
    
    return unsubscribe;
  }, []);
  
  // Appliquer un filtre à un log
  const applyFilter = (log: StructuredLog, filterSettings: typeof filter): boolean => {
    if (filterSettings.level && log.level !== filterSettings.level) return false;
    if (filterSettings.source && log.source !== filterSettings.source) return false;
    if (filterSettings.tags && filterSettings.tags.length > 0) {
      if (!log.tags || !filterSettings.tags.some(tag => log.tags?.includes(tag))) return false;
    }
    if (filterSettings.hasError && !log.error) return false;
    if (filterSettings.fromTimestamp && log.timestamp < filterSettings.fromTimestamp) return false;
    if (filterSettings.toTimestamp && log.timestamp > filterSettings.toTimestamp) return false;
    if (filterSettings.messageContains && !log.message.includes(filterSettings.messageContains)) return false;
    
    return true;
  };
  
  // Mettre à jour le filtre
  useEffect(() => {
    setFilteredLogs(logs.filter(log => applyFilter(log, filter)));
  }, [filter, logs]);
  
  /**
   * Mettre à jour les filtres
   */
  const updateFilter = useCallback((newFilter: Partial<typeof filter>) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      ...newFilter
    }));
  }, []);
  
  /**
   * Effacer les filtres
   */
  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);
  
  /**
   * Log de niveau trace
   */
  const trace = useCallback((message: string, context?: Record<string, any>, options?: {
    source?: string;
    tags?: string[];
  }) => {
    structuredLogger.trace(message, context, options);
  }, []);
  
  /**
   * Log de niveau debug
   */
  const debug = useCallback((message: string, context?: Record<string, any>, options?: {
    source?: string;
    tags?: string[];
  }) => {
    structuredLogger.debug(message, context, options);
  }, []);
  
  /**
   * Log de niveau info
   */
  const info = useCallback((message: string, context?: Record<string, any>, options?: {
    source?: string;
    tags?: string[];
  }) => {
    structuredLogger.info(message, context, options);
  }, []);
  
  /**
   * Log de niveau warn
   */
  const warn = useCallback((message: string, context?: Record<string, any>, options?: {
    source?: string;
    tags?: string[];
  }) => {
    structuredLogger.warn(message, context, options);
  }, []);
  
  /**
   * Log de niveau error
   */
  const error = useCallback((message: string, errorOrContext?: Error | Record<string, any>, options?: {
    context?: Record<string, any>;
    source?: string;
    tags?: string[];
  }) => {
    structuredLogger.error(message, errorOrContext, options);
  }, []);
  
  /**
   * Log de niveau fatal
   */
  const fatal = useCallback((message: string, errorOrContext?: Error | Record<string, any>, options?: {
    context?: Record<string, any>;
    source?: string;
    tags?: string[];
  }) => {
    structuredLogger.fatal(message, errorOrContext, options);
  }, []);
  
  /**
   * Effacer tous les logs
   */
  const clearLogs = useCallback(() => {
    structuredLogger.clearLogs();
    setLogs([]);
    setFilteredLogs([]);
  }, []);
  
  return {
    logs,
    filteredLogs,
    updateFilter,
    clearFilter,
    filter,
    trace,
    debug,
    info,
    warn,
    error,
    fatal,
    clearLogs
  };
}
