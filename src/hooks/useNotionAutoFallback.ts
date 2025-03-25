
import { useState, useEffect } from 'react';
import { useConnectionMode } from './useConnectionMode';
import { toast } from 'sonner';

/**
 * Hook qui surveille les opérations Notion et gère automatiquement le fallback
 * vers le mode démo en cas d'erreur, avec une notification claire pour l'utilisateur
 */
export function useNotionAutoFallback() {
  const { 
    currentMode, 
    switchReason, 
    connectionHealth,
    isDemoMode, 
    isRealMode,
    enableRealMode, 
    handleConnectionError, 
    handleSuccessfulOperation 
  } = useConnectionMode();

  // S'abonner aux changements de mode
  useEffect(() => {
    // Afficher une notification détaillée lors du basculement automatique
    if (isDemoMode && switchReason?.includes('automatique')) {
      toast.warning('Passage automatique en mode démonstration', {
        description: 'Des problèmes de connexion à Notion ont été détectés. L\'application utilise maintenant des données fictives.',
        duration: 5000,
        action: {
          label: 'Réessayer en mode réel',
          onClick: () => {
            enableRealMode();
            toast.info('Tentative de reconnexion à Notion...'); 
          }
        }
      });
    }
  }, [isDemoMode, switchReason, enableRealMode]);

  /**
   * Fonction utilitaire pour signaler une erreur Notion et gérer automatiquement le fallback
   */
  const reportNotionError = (error: Error | unknown, context: string = 'Opération Notion') => {
    if (error instanceof Error) {
      handleConnectionError(error, context);
    } else {
      handleConnectionError(
        new Error(typeof error === 'string' ? error : 'Erreur inconnue'),
        context
      );
    }
  };

  /**
   * Fonction utilitaire pour signaler une opération Notion réussie
   */
  const reportNotionSuccess = () => {
    handleSuccessfulOperation();
  };

  /**
   * Fonction pour tenter de revenir en mode réel
   */
  const attemptRealMode = () => {
    if (isDemoMode) {
      enableRealMode();
      toast.info('Tentative de reconnexion à Notion...'); 
    }
  };

  return {
    isDemoMode,
    isRealMode,
    currentMode,
    lastReason: switchReason,
    failures: connectionHealth.consecutiveErrors,
    reportNotionError,
    reportNotionSuccess,
    attemptRealMode
  };
}
