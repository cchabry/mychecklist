
import { useCallback } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useOperationQueue } from '@/hooks/api/useOperationQueue';
import { ErrorCategory } from './useErrorHandling';
import { SwitchReason } from '@/lib/operationMode/types';

/**
 * Hook qui fournit des stratégies de récupération pour différents types d'erreurs
 */
export function useRecoveryStrategies() {
  const { enableDemoMode, isRealMode } = useOperationMode();
  const navigate = useNavigate();
  const { processQueue } = useOperationQueue();

  /**
   * Active le mode démo
   */
  const enableDemoModeStrategy = useCallback((reason: string = 'Récupération après erreur') => {
    if (isRealMode) {
      enableDemoMode(SwitchReason.AFTER_ERROR);
      toast.success('Mode démonstration activé', {
        description: 'L\'application utilise maintenant des données fictives'
      });
    }
  }, [enableDemoMode, isRealMode]);

  /**
   * Redirige vers la page d'accueil
   */
  const navigateHomeStrategy = useCallback(() => {
    navigate('/');
    toast.info('Redirection vers la page d\'accueil');
  }, [navigate]);

  /**
   * Redirige vers la page de configuration
   */
  const navigateToSettingsStrategy = useCallback(() => {
    navigate('/settings');
    toast.info('Redirection vers les paramètres');
  }, [navigate]);

  /**
   * Recharge la page courante
   */
  const reloadPageStrategy = useCallback(() => {
    window.location.reload();
  }, []);

  /**
   * Traite la file d'attente des opérations
   */
  const processQueueStrategy = useCallback(() => {
    processQueue();
    toast.info('Traitement des opérations en attente...');
  }, [processQueue]);

  /**
   * Récupère une stratégie appropriée pour un type d'erreur donné
   */
  const getRecoveryStrategyForCategory = useCallback((category: ErrorCategory) => {
    switch (category) {
      case 'network':
        return {
          primary: enableDemoModeStrategy,
          secondary: processQueueStrategy,
          description: 'Problème de connexion réseau'
        };
        
      case 'authentication':
        return {
          primary: navigateToSettingsStrategy,
          secondary: enableDemoModeStrategy,
          description: 'Problème d\'authentification'
        };
        
      case 'authorization':
        return {
          primary: navigateToSettingsStrategy,
          secondary: enableDemoModeStrategy,
          description: 'Problème de permissions'
        };
        
      case 'resource':
        return {
          primary: navigateHomeStrategy,
          secondary: reloadPageStrategy,
          description: 'Ressource non trouvée'
        };
        
      case 'timeout':
        return {
          primary: processQueueStrategy,
          secondary: enableDemoModeStrategy,
          description: 'Délai d\'attente dépassé'
        };
        
      default:
        return {
          primary: reloadPageStrategy,
          secondary: navigateHomeStrategy,
          description: 'Erreur applicative'
        };
    }
  }, [
    enableDemoModeStrategy,
    navigateHomeStrategy,
    navigateToSettingsStrategy,
    processQueueStrategy,
    reloadPageStrategy
  ]);

  /**
   * Tente de récupérer automatiquement d'une erreur
   */
  const attemptAutomaticRecovery = useCallback((category: ErrorCategory, critical: boolean) => {
    // Ne tenter la récupération automatique que pour certaines catégories
    if (['network', 'timeout', 'api'].includes(category) && !critical) {
      processQueueStrategy();
      return true;
    }
    
    // Pour les erreurs de ressource non critiques, rediriger vers l'accueil
    if (category === 'resource' && !critical) {
      navigateHomeStrategy();
      return true;
    }
    
    return false;
  }, [navigateHomeStrategy, processQueueStrategy]);

  return {
    enableDemoModeStrategy,
    navigateHomeStrategy,
    navigateToSettingsStrategy,
    reloadPageStrategy,
    processQueueStrategy,
    getRecoveryStrategyForCategory,
    attemptAutomaticRecovery
  };
}
