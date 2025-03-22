
import { useState, useCallback } from 'react';
import { operationMode, OperationMode } from '@/services/operationMode';
import { toast } from 'sonner';

// Type générique pour les options de requête
interface NotionRequestOptions<T> {
  // Fonction pour générer des données de démonstration
  demoData?: () => T | Promise<T>;
  // Message de succès à afficher
  successMessage?: string;
  // Message d'erreur personnalisé
  errorMessage?: string;
  // Contexte de l'opération (pour les logs et erreurs)
  context?: string;
  // Forcer le mode de fonctionnement pour cette requête uniquement
  forceMode?: OperationMode;
  // Afficher des notifications pour cette requête
  notifications?: boolean;
  // Désactiver le fallback automatique pour cette requête
  disableAutoFallback?: boolean;
}

/**
 * Hook pour l'interaction avec l'API Notion avec fallback automatique
 * Remplace l'ancien système de Mock par une approche plus élégante
 */
export function useNotionFallbackAPI<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  /**
   * Exécute une requête à l'API Notion avec fallback sur les données de démo
   */
  const executeRequest = useCallback(async <R = T>(
    // Fonction qui exécute la requête réelle à l'API Notion
    requestFn: () => Promise<R>,
    // Options pour la requête
    options: NotionRequestOptions<R> = {}
  ): Promise<R | null> => {
    const {
      demoData,
      successMessage,
      errorMessage = 'Erreur lors de la requête Notion',
      context = 'Opération Notion',
      forceMode,
      notifications = true,
      disableAutoFallback = false
    } = options;
    
    // Déterminer le mode d'opération
    const currentMode = forceMode || operationMode.mode;
    const isDemo = currentMode === OperationMode.DEMO;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // En mode démo, utiliser les données de démonstration si disponibles
      if (isDemo && demoData) {
        // Simuler un délai réaliste pour l'UX
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));
        
        // Récupérer les données de démo (synchrones ou asynchrones)
        const mockResult = await Promise.resolve(demoData());
        
        setData(mockResult as unknown as T);
        setIsLoading(false);
        
        if (successMessage && notifications) {
          toast.success(successMessage, {
            description: 'Utilisation de données démo'
          });
        }
        
        return mockResult;
      }
      
      // En mode réel, exécuter la requête Notion
      const result = await requestFn();
      
      // Opération réussie
      if (successMessage && notifications) {
        toast.success(successMessage);
      }
      
      // Notifier le service de mode qu'une opération a réussi
      operationMode.handleSuccessfulOperation();
      
      setData(result as unknown as T);
      return result;
    } catch (err) {
      // Conversion en Error standard
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Afficher l'erreur
      if (notifications) {
        toast.error(errorMessage, {
          description: error.message
        });
      }
      
      // Notifier le service de mode
      operationMode.handleConnectionError(error, context);
      
      // Vérifier si on doit faire un fallback automatique
      if (!disableAutoFallback && demoData) {
        // Si la limite d'échecs est atteinte OU si nous sommes déjà en mode transition
        if (operationMode.failures >= 2 || operationMode.isTransitioning) {
          try {
            // Activer le mode démo si ce n'est pas déjà fait
            if (!operationMode.isDemoMode) {
              operationMode.enableDemoMode(`Erreur: ${error.message}`);
            }
            
            // Récupérer les données de démo en fallback
            const fallbackData = await Promise.resolve(demoData());
            
            // Informer l'utilisateur du fallback
            if (notifications) {
              toast.info('Utilisation de données de secours', {
                description: "Suite à une erreur de connexion à Notion"
              });
            }
            
            setData(fallbackData as unknown as T);
            return fallbackData;
          } catch (fallbackError) {
            // En cas d'erreur dans le fallback, on garde l'erreur originale
            console.error('Erreur dans les données de fallback', fallbackError);
          }
        }
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    error,
    data,
    executeRequest,
    isDemoMode: operationMode.isDemoMode,
    isRealMode: operationMode.isRealMode
  };
}
