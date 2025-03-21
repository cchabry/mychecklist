
import { useState, useEffect } from 'react';
import { operationMode, OperationMode } from '@/services/operationMode';
import { toast } from 'sonner';

/**
 * Hook qui surveille les opérations Notion et gère automatiquement le fallback
 * vers le mode démo en cas d'erreur, avec une notification claire pour l'utilisateur
 */
export function useNotionAutoFallback() {
  const [currentMode, setCurrentMode] = useState<OperationMode>(operationMode.mode);
  const [lastReason, setLastReason] = useState<string | null>(operationMode.switchReason);
  const [failures, setFailures] = useState<number>(operationMode.failures);

  // S'abonner aux changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode: OperationMode) => {
      setCurrentMode(newMode);
      setLastReason(operationMode.switchReason);
      setFailures(operationMode.failures);
      
      // Afficher une notification détaillée lors du basculement automatique
      if (newMode === OperationMode.DEMO && operationMode.switchReason?.includes('Échec de connexion')) {
        toast.warning('Passage automatique en mode démonstration', {
          description: 'Des problèmes de connexion à Notion ont été détectés. L\'application utilise maintenant des données fictives.',
          duration: 5000,
          action: {
            label: 'Réessayer en mode réel',
            onClick: () => {
              operationMode.enableRealMode();
              toast.info('Tentative de reconnexion à Notion...'); 
            }
          }
        });
      }
    });
    
    return unsubscribe;
  }, []);

  /**
   * Fonction utilitaire pour signaler une erreur Notion et gérer automatiquement le fallback
   */
  const reportNotionError = (error: Error | unknown, context: string = 'Opération Notion') => {
    if (error instanceof Error) {
      operationMode.handleConnectionError(error, context);
    } else {
      operationMode.handleConnectionError(
        new Error(typeof error === 'string' ? error : 'Erreur inconnue'),
        context
      );
    }
  };

  /**
   * Fonction utilitaire pour signaler une opération Notion réussie
   */
  const reportNotionSuccess = () => {
    operationMode.handleSuccessfulOperation();
  };

  /**
   * Fonction pour tenter de revenir en mode réel
   */
  const attemptRealMode = () => {
    if (operationMode.isDemoMode) {
      operationMode.enableRealMode();
      toast.info('Tentative de reconnexion à Notion...'); 
    }
  };

  return {
    isDemoMode: operationMode.isDemoMode,
    isRealMode: operationMode.isRealMode,
    currentMode,
    lastReason,
    failures,
    reportNotionError,
    reportNotionSuccess,
    attemptRealMode
  };
}
