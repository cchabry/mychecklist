
import { useNotionAPI } from './notion/useNotionAPI';
import { useOperationMode } from '@/services/operationMode';

/**
 * Version améliorée du hook useNotionApi qui intègre la gestion automatique 
 * des erreurs et le fallback vers le mode démo
 * 
 * @deprecated Utiliser useNotionAPI importé depuis './notion/useNotionAPI' à la place
 */
export function useNotionApi<T = any>() {
  const notionAPI = useNotionAPI<T>();
  const operationMode = useOperationMode();
  
  // Version améliorée de makeRequest qui gère automatiquement les erreurs avec operationMode
  const makeRequest = async <R = T>(
    apiFunction: () => Promise<R>,
    errorContext: string = 'Requête Notion'
  ): Promise<R> => {
    try {
      const result = await apiFunction();
      
      // Signaler l'opération réussie au système operationMode
      if (typeof operationMode.handleSuccessfulOperation === 'function') {
        operationMode.handleSuccessfulOperation();
      } else {
        // Fallback if the method doesn't exist
        operationMode.enableRealMode();
      }
      
      return result;
    } catch (error) {
      // Signaler l'erreur au système operationMode
      if (typeof operationMode.handleConnectionError === 'function') {
        operationMode.handleConnectionError(
          error instanceof Error ? error : new Error(String(error)),
          errorContext
        );
      } else {
        // Fallback if the method doesn't exist
        operationMode.enableDemoMode(errorContext);
      }
      
      // Relancer l'erreur pour la gestion en aval
      throw error;
    }
  };
  
  return {
    ...notionAPI,
    makeRequest,
    isDemoMode: operationMode.isDemoMode
  };
}
