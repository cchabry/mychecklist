
import { useNotionAPI } from './notion/useNotionAPI';
import { operationMode } from '@/services/operationMode';

/**
 * Version améliorée du hook useNotionApi qui intègre la gestion automatique 
 * des erreurs et le fallback vers le mode démo
 * 
 * @deprecated Utiliser useNotionAPI importé depuis './notion/useNotionAPI' à la place
 */
export function useNotionApi<T = any>() {
  const notionAPI = useNotionAPI<T>();
  
  // Version améliorée de makeRequest qui gère automatiquement les erreurs avec operationMode
  const makeRequest = async <R = T>(
    apiFunction: () => Promise<R>,
    errorContext: string = 'Requête Notion'
  ): Promise<R> => {
    try {
      const result = await apiFunction();
      
      // Signaler l'opération réussie au système operationMode
      operationMode.handleSuccessfulOperation();
      
      return result;
    } catch (error) {
      // Signaler l'erreur au système operationMode
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        errorContext
      );
      
      // Relancer l'erreur pour la gestion en aval
      throw error;
    }
  };
  
  return {
    ...notionAPI,
    makeRequest,
    isDemoMode: operationMode.isDemoMode()
  };
}
