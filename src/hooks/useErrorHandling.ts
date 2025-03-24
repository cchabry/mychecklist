import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';
import { notionErrorService, NotionErrorType, NotionErrorSeverity } from '@/services/notion/errorHandling';
import { SwitchReason } from '@/lib/operationMode/types';

export type ErrorCategory = 
  | 'network'        // Erreurs de connexion réseau
  | 'authentication' // Problèmes d'authentification
  | 'authorization'  // Problèmes de permissions
  | 'validation'     // Données invalides
  | 'resource'       // Ressource non trouvée
  | 'timeout'        // Délai d'expiration
  | 'api'            // Erreurs d'API
  | 'business'       // Erreurs métier
  | 'unknown';       // Erreurs non catégorisées

export interface ErrorDetails {
  message: string;
  category: ErrorCategory;
  context?: string;
  timestamp: number;
  isCritical: boolean;
  isRecoverable: boolean;
  originalError?: Error | unknown;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * Hook centralisé pour la gestion des erreurs
 */
export function useErrorHandling() {
  const [lastError, setLastError] = useState<ErrorDetails | null>(null);
  const { handleConnectionError, handleSuccessfulOperation, isDemoMode, enableDemoMode } = useOperationMode();

  /**
   * Détermine la catégorie d'erreur en fonction du message et du contexte
   */
  const categorizeError = useCallback((error: Error | string, context?: string): ErrorCategory => {
    const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connexion') || message.includes('connection')) {
      return 'network';
    }
    
    if (message.includes('auth') || message.includes('token') || message.includes('login') || message.includes('identifi')) {
      return 'authentication';
    }
    
    if (message.includes('permission') || message.includes('accès') || message.includes('access') || message.includes('forbidden') || message.includes('interdit')) {
      return 'authorization';
    }
    
    if (message.includes('valide') || message.includes('invalid') || message.includes('format') || message.includes('required')) {
      return 'validation';
    }
    
    if (message.includes('not found') || message.includes('introuvable') || message.includes('404')) {
      return 'resource';
    }
    
    if (message.includes('timeout') || message.includes('expir') || message.includes('délai')) {
      return 'timeout';
    }
    
    if (message.includes('api') || message.includes('service') || message.includes('endpoint')) {
      return 'api';
    }
    
    if (context?.includes('business') || context?.includes('métier')) {
      return 'business';
    }
    
    return 'unknown';
  }, []);

  /**
   * Détermine si une erreur est critique en fonction de sa catégorie et du message
   */
  const isCriticalError = useCallback((category: ErrorCategory, message: string): boolean => {
    // Les erreurs d'authentification sont toujours critiques
    if (category === 'authentication') return true;
    
    // Les erreurs d'autorisation sont généralement critiques
    if (category === 'authorization') return true;
    
    // Les erreurs de ressource peuvent être critiques selon le contexte
    if (category === 'resource' && (
      message.includes('base') || 
      message.includes('projet') || 
      message.includes('config')
    )) return true;
    
    // Les erreurs réseau persistantes sont critiques
    if (category === 'network' && (
      message.includes('failed repeatedly') || 
      message.includes('plusieurs échecs')
    )) return true;
    
    return false;
  }, []);

  /**
   * Détermine si une erreur peut être récupérée automatiquement
   */
  const isRecoverableError = useCallback((category: ErrorCategory): boolean => {
    // Les erreurs réseau et de timeout sont généralement récupérables
    return category === 'network' || 
           category === 'timeout' || 
           category === 'api';
  }, []);

  /**
   * Génère des actions de récupération en fonction de la catégorie d'erreur
   */
  const generateRecoveryActions = useCallback((category: ErrorCategory, context?: string) => {
    const actions: Array<{ label: string; action: () => void }> = [];
    
    // Actions spécifiques par catégorie
    switch (category) {
      case 'network':
        actions.push({
          label: 'Passer en mode démonstration',
          action: () => enableDemoMode(SwitchReason.NETWORK_ERROR)
        });
        break;
        
      case 'authentication':
        // Actions pour les erreurs d'authentification
        if (context?.includes('notion')) {
          actions.push({
            label: 'Configurer l\'API Notion',
            action: () => {
              // Navigation vers la page de configuration (à implémenter)
              toast.info('Navigation vers la configuration Notion');
            }
          });
        }
        break;
        
      case 'timeout':
        actions.push({
          label: 'Réessayer avec un délai plus long',
          action: () => {
            toast.info('Nouvelle tentative avec un délai plus long');
            // Action de réessai à implémenter
          }
        });
        break;
    }
    
    // Ajouter une action générique pour passer en mode démo
    if (!isDemoMode && !actions.some(a => a.label.includes('démonstration'))) {
      actions.push({
        label: 'Utiliser le mode démonstration',
        action: () => enableDemoMode(SwitchReason.AFTER_ERROR)
      });
    }
    
    return actions;
  }, [enableDemoMode, isDemoMode]);

  /**
   * Fonction principale pour capturer et traiter une erreur
   */
  const handleError = useCallback((
    error: Error | string | unknown,
    context?: string,
    options: {
      showToast?: boolean;
      notifyMode?: boolean;
      notifyNotion?: boolean;
      customRecoveryActions?: Array<{ label: string; action: () => void }>;
    } = {}
  ) => {
    const { 
      showToast = true, 
      notifyMode = true,
      notifyNotion = false,
      customRecoveryActions = []
    } = options;
    
    // Normaliser l'erreur
    const normalizedError = typeof error === 'string' 
      ? new Error(error) 
      : error instanceof Error 
        ? error 
        : new Error(String(error));
    
    // Catégoriser l'erreur
    const category = categorizeError(normalizedError, context);
    
    // Déterminer si l'erreur est critique et récupérable
    const critical = isCriticalError(category, normalizedError.message);
    const recoverable = isRecoverableError(category);
    
    // Générer les actions de récupération
    const recoveryActions = [
      ...generateRecoveryActions(category, context),
      ...customRecoveryActions
    ];
    
    // Créer l'objet d'erreur détaillé
    const errorDetails: ErrorDetails = {
      message: normalizedError.message,
      category,
      context,
      timestamp: Date.now(),
      isCritical: critical,
      isRecoverable: recoverable,
      originalError: error,
      recoveryActions
    };
    
    // Stocker l'erreur
    setLastError(errorDetails);
    
    // Notifier le système de mode opérationnel
    if (notifyMode) {
      handleConnectionError(normalizedError, context || 'Erreur applicative');
    }
    
    // Notifier le service d'erreurs Notion si nécessaire
    if (notifyNotion) {
      const severity = critical 
        ? NotionErrorSeverity.CRITICAL 
        : category === 'network' 
          ? NotionErrorSeverity.ERROR 
          : NotionErrorSeverity.WARNING;
          
      let notionType: NotionErrorType;
      switch (category) {
        case 'authentication': notionType = NotionErrorType.AUTH; break;
        case 'authorization': notionType = NotionErrorType.PERMISSION; break;
        case 'network': notionType = NotionErrorType.NETWORK; break;
        case 'timeout': notionType = NotionErrorType.TIMEOUT; break;
        case 'resource': notionType = NotionErrorType.NOT_FOUND; break;
        default: notionType = NotionErrorType.UNKNOWN;
      }
      
      notionErrorService.reportError(normalizedError, context, {
        type: notionType,
        severity
      });
    }
    
    // Afficher un toast d'erreur
    if (showToast) {
      const toastOptions: any = {
        description: context || undefined,
        duration: critical ? 8000 : 5000,
      };
      
      // Ajouter des actions de récupération au toast si disponibles
      if (recoveryActions.length > 0) {
        const primaryAction = recoveryActions[0];
        toastOptions.action = {
          label: primaryAction.label,
          onClick: primaryAction.action
        };
      }
      
      toast.error(normalizedError.message, toastOptions);
    }
    
    // Basculer automatiquement en mode démo pour certaines erreurs critiques
    if (critical && category === 'network' && context?.includes('repeated') && !isDemoMode) {
      enableDemoMode(SwitchReason.REPEATED_ERRORS);
      
      toast.warning('Passage automatique en mode démonstration', {
        description: 'Plusieurs erreurs réseau ont été détectées. L\'application utilise maintenant des données fictives.'
      });
    }
    
    return errorDetails;
  }, [
    categorizeError, 
    isCriticalError, 
    isRecoverableError, 
    generateRecoveryActions, 
    handleConnectionError, 
    enableDemoMode, 
    isDemoMode
  ]);

  /**
   * Signale une opération réussie
   */
  const handleSuccess = useCallback((message?: string) => {
    if (lastError) {
      setLastError(null);
    }
    
    handleSuccessfulOperation();
    
    if (message) {
      toast.success(message);
    }
  }, [lastError, handleSuccessfulOperation]);

  /**
   * Récupère la dernière erreur capturée
   */
  const getLastError = useCallback(() => lastError, [lastError]);

  /**
   * Efface la dernière erreur
   */
  const clearLastError = useCallback(() => setLastError(null), []);

  return {
    handleError,
    handleSuccess,
    lastError,
    getLastError,
    clearLastError,
    categorizeError,
    isCriticalError,
    isRecoverableError,
    generateRecoveryActions
  };
}
