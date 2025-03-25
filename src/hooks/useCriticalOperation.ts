
import { useCallback } from 'react';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

/**
 * Options pour les opérations critiques
 */
interface CriticalOperationOptions {
  context: string;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour exécuter des opérations critiques qui ne doivent pas
 * déclencher de bascule en mode démo même en cas d'erreur
 */
export function useCriticalOperation() {
  /**
   * Exécute une opération critique
   * @param operation La fonction à exécuter
   * @param options Options de configuration
   * @returns Le résultat de l'opération
   */
  const executeCriticalOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: CriticalOperationOptions
  ): Promise<T | null> => {
    const {
      context,
      successMessage = 'Opération réussie',
      errorMessage = 'Une erreur est survenue',
      showSuccessToast = true,
      showErrorToast = true,
      onSuccess,
      onError
    } = options;

    try {
      // Marquer cette opération comme critique
      operationMode.markOperationAsCritical(context);
      
      // Exécuter l'opération
      const result = await operation();
      
      // Signaler le succès
      operationMode.handleSuccessfulOperation();
      
      // Afficher un message de succès si demandé
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error) {
      console.error(`[CriticalOperation] Erreur dans ${context}:`, error);
      
      // Signaler l'erreur mais sans basculer en mode démo
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      
      // Afficher un message d'erreur si demandé
      if (showErrorToast) {
        toast.error(errorMessage, {
          description: error instanceof Error ? error.message : String(error)
        });
      }
      
      // Appeler le callback d'erreur si fourni
      if (onError && error instanceof Error) {
        onError(error);
      }
      
      return null;
    } finally {
      // Démarquer l'opération comme critique
      operationMode.unmarkOperationAsCritical(context);
    }
  }, []);

  return {
    executeCriticalOperation
  };
}
