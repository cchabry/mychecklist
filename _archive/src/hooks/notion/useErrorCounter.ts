
import { useState, useEffect, useCallback } from 'react';
import { errorCounter } from '@/services/notion/monitoring/errorCounter';
import { ErrorCounterStats, NotionErrorType, AlertThresholdConfig } from '@/services/notion/errorHandling/types';

/**
 * Hook pour utiliser le compteur d'erreurs
 */
export function useErrorCounter() {
  // Utiliser une fonction pour initialiser l'état
  const [stats, setStats] = useState<ErrorCounterStats>(() => errorCounter.getStats());
  const [alerts, setAlerts] = useState<string[]>([]);
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    // Vérifier si la méthode subscribe existe
    if (typeof (errorCounter as any).subscribe === 'function') {
      const unsubscribe = (errorCounter as any).subscribe((newStats: ErrorCounterStats, newAlerts: string[]) => {
        setStats(newStats);
        setAlerts(newAlerts);
      });
      
      return unsubscribe;
    }
    
    // Fallback si subscribe n'existe pas: polling régulier
    const interval = setInterval(() => {
      setStats(errorCounter.getStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Configurer les seuils d'alerte
   */
  const configureThresholds = useCallback((thresholds: AlertThresholdConfig) => {
    if (typeof (errorCounter as any).configureThresholds === 'function') {
      (errorCounter as any).configureThresholds(thresholds);
    }
  }, []);
  
  /**
   * Réinitialiser les statistiques
   */
  const resetStats = useCallback(() => {
    if (typeof (errorCounter as any).resetStats === 'function') {
      (errorCounter as any).resetStats();
    } else if (typeof errorCounter.getStats === 'function') {
      // Fallback
      console.warn('resetStats non disponible, utilisation du fallback');
    }
  }, []);
  
  /**
   * Enregistrer une erreur manuellement
   */
  const recordError = useCallback((error: Error, endpoint?: string) => {
    if (typeof (errorCounter as any).recordError === 'function') {
      (errorCounter as any).recordError(error, endpoint);
    }
  }, []);
  
  /**
   * Obtenir le taux d'erreur actuel par minute
   */
  const getCurrentErrorRatePerMinute = useCallback((): number => {
    const currentMinute = Math.floor(Date.now() / 60000);
    return stats.byMinute ? stats.byMinute[currentMinute] || 0 : 0;
  }, [stats]);
  
  /**
   * Obtenir le taux d'erreur actuel par heure
   */
  const getCurrentErrorRatePerHour = useCallback((): number => {
    const currentHour = Math.floor(Date.now() / 3600000);
    return stats.byHour ? stats.byHour[currentHour] || 0 : 0;
  }, [stats]);
  
  /**
   * Obtenir les erreurs les plus fréquentes par type
   */
  const getTopErrorTypes = useCallback((limit: number = 3): { type: NotionErrorType; count: number }[] => {
    if (!stats.byType) return [];
    
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
    if (!stats.byEndpoint) return [];
    
    return Object.entries(stats.byEndpoint || {})
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
        count: stats.byHour ? stats.byHour[hour] || 0 : 0
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
