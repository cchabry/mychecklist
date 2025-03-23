
import { useState, useCallback } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { useErrorReporter } from './useErrorReporter';
import { toast } from 'sonner';

export interface NotionAPIOptions<T> {
  // Données à utiliser en mode démonstration
  demoData?: T;
  
  // Simuler un délai en mode démonstration (ms)
  simulatedDelay?: number;
  
  // Montrer automatiquement un toast de chargement
  showLoadingToast?: boolean;
  
  // Montrer automatiquement un toast d'erreur
  showErrorToast?: boolean;
  
  // Messages personnalisés
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  
  // Contexte pour les rapports d'erreur
  errorContext?: string;
}

/**
 * Hook standardisé pour effectuer des appels à l'API Notion
 * Gestion automatique du mode démo et des erreurs
 */
export function useNotionAPI() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode, settings } = useOperationMode();
  const { reportError, reportSuccess } = useErrorReporter();
  
  /**
   * Exécute une opération Notion avec gestion automatique du mode
   * @param operation La fonction à exécuter en mode réel
   * @param options Options de configuration
   */
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: NotionAPIOptions<T> = {}
  ): Promise<T> => {
    // Extraire les options avec valeurs par défaut
    const {
      demoData,
      simulatedDelay = settings.simulatedNetworkDelay,
      showLoadingToast = false,
      showErrorToast = true,
      messages = {},
      errorContext = 'Opération Notion'
    } = options;
    
    // Réinitialiser l'état
    setError(null);
    setIsLoading(true);
    
    // Afficher un toast de chargement si demandé
    let loadingToastId;
    if (showLoadingToast) {
      loadingToastId = toast.loading(
        messages.loading || 'Chargement en cours...'
      );
    }
    
    try {
      let result: T;
      
      // Déterminer si on utilise le mode démonstration
      if (isDemoMode) {
        // En mode démo, on utilise les données simulées
        if (demoData === undefined) {
          throw new Error('Aucune donnée de démonstration fournie pour cette opération');
        }
        
        // Simuler un délai réseau
        if (simulatedDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, simulatedDelay));
        }
        
        // Simuler aléatoirement une erreur si configuré
        if (settings.errorSimulationRate > 0) {
          const shouldError = Math.random() * 100 < settings.errorSimulationRate;
          if (shouldError) {
            throw new Error('Erreur simulée en mode démonstration');
          }
        }
        
        result = demoData;
        console.log('[NotionAPI] Mode démo - Utilisation des données simulées', demoData);
      } else {
        // En mode réel, on exécute l'opération
        result = await operation();
        
        // Signaler une opération réussie
        reportSuccess();
      }
      
      // Mettre à jour l'état et les toasts
      setIsLoading(false);
      if (loadingToastId && messages.success) {
        toast.success(messages.success, { id: loadingToastId });
      } else if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      return result;
    } catch (err) {
      // Gérer l'erreur
      const formattedError = err instanceof Error ? err : new Error(String(err));
      setError(formattedError);
      setIsLoading(false);
      
      // Signaler l'erreur au système de reporting
      reportError(formattedError, errorContext, { 
        showToast: showErrorToast,
        toastMessage: messages.error || "Erreur lors de l'opération"
      });
      
      // Mettre à jour le toast de chargement
      if (loadingToastId) {
        toast.error(messages.error || "Erreur lors de l'opération", { 
          id: loadingToastId,
          description: formattedError.message
        });
      }
      
      throw formattedError;
    }
  }, [isDemoMode, settings, reportError, reportSuccess]);
  
  return {
    executeOperation,
    isLoading,
    error,
    isDemoMode,
    clearError: () => setError(null)
  };
}

// Ajouter un avertissement de dépréciation pour l'ancien useNotionRequest
console.warn(
  "[Deprecated] useNotionRequest est déprécié et sera supprimé dans une future version. " +
  "Veuillez utiliser useNotionAPI à la place."
);
