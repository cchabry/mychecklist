
import { useState, useEffect, useCallback } from 'react';
import { errorCounter } from '@/services/notion/monitoring/errorCounter';
import { ErrorCounterStats, NotionErrorType, AlertThresholdConfig } from '@/services/notion/errorHandling/types';

/**
 * Hook pour utiliser le compteur d'erreurs
 */
export function useErrorCounter() {
  const [stats, setStats] = useState<ErrorCounterStats>(errorCounter.getStats());
  const [alerts, setAlerts] = useState<string[]>([]);
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    const unsubscribe = errorCounter.subscribe((newStats, newAlerts) => {
      setStats(newStats);
      setAlerts(newAlerts);
    });
    
    return unsubscribe;
  }, []);
  
  /**
   * Configurer les seuils d'alerte
   */
  const configureThresholds = useCallback((thresholds: AlertThresholdConfig) => {
    errorCounter.configureThresholds(thresholds);
  }, []);
  
  /**
   * Réinitialiser les statistiques
   */
  const resetStats = useCallback(() => {
    errorCounter.resetStats();
  }, []);
  
  /**
   * Enregistrer une erreur manuellement
   */
  const recordError = useCallback((error: Error, endpoint?: string) => {
    errorCounter.recordError(error, endpoint);
  }, []);
  
  /**
   * Obtenir le taux d'erreur actuel par minute
   */
  const getCurrentErrorRatePerMinute = useCallback((): number => {
    const currentMinute = Math.floor(Date.now() / 60000);
    return stats.byMinute[currentMinute] || 0;
  }, [stats]);
  
  /**
   * Obtenir le taux d'erreur actuel par heure
   */
  const getCurrentErrorRatePerHour = useCallback((): number => {
    const currentHour = Math.floor(Date.now() / 3600000);
    return stats.byHour[currentHour] || 0;
  }, [stats]);
  
  /**
   * Obtenir les erreurs les plus fréquentes par type
   */
  const getTopErrorTypes = useCallback((limit: number = 3): { type: NotionErrorType; count: number }[] => {
    return Object.entries(stats.byType)
      .map(([type, count]) => ({ type: type as NotionErrorType, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [stats]);
  
  /**
   * Obtenir les erreurs les plus fréquentes par endpoint
   */
  const getTopErrorEndpoints = useCallback((limit: number = 3): { endpoint: string; count: number }[] => {
    return Object.entries(stats.byEndpoint)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [stats]);
  
  /**
   * Obtenir la tendance d'erreur sur les dernières heures
   */
  const getErrorTrendByHour = useCallback((hours: number = 24): { hour: number; count: number }[] => {
    const currentHour = Math.floor(Date.now() / 3600000);
    
    // Créer un tableau des N dernières heures
    const result: { hour: number; count: number }[] = [];
    
    for (let i = 0; i < hours; i++) {
      const hour = currentHour - i;
      result.push({
        hour,
        count: stats.byHour[hour] || 0
      });
    }
    
    return result.reverse(); // Du plus ancien au plus récent
  }, [stats]);
  
  return {
    stats,
    alerts,
    configureThresholds,
    resetStats,
    recordError,
    getCurrentErrorRatePerMinute,
    getCurrentErrorRatePerHour,
    getTopErrorTypes,
    getTopErrorEndpoints,
    getErrorTrendByHour
  };
}
