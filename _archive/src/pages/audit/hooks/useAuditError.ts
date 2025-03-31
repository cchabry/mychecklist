
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { useNavigate } from 'react-router-dom';

export interface AuditError {
  message: string;
  details?: string;
  isCritical?: boolean;
  source?: string;
  timestamp?: number;
}

/**
 * Custom hook for handling audit-related errors
 */
export const useAuditError = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<AuditError | null>(null);
  
  /**
   * Handle errors from different parts of the audit system
   */
  const handleError = useCallback((newError: Error | AuditError | string, context?: string) => {
    // Convert all error formats to our standardized AuditError
    let formattedError: AuditError;
    
    if (typeof newError === 'string') {
      formattedError = {
        message: newError,
        source: context,
        timestamp: Date.now()
      };
    } else if (newError instanceof Error) {
      formattedError = {
        message: newError.message,
        details: newError.stack,
        source: context,
        timestamp: Date.now(),
        // Network/fetch errors are often critical
        isCritical: newError.message.includes('fetch') || 
                    newError.message.includes('network') ||
                    newError.message.includes('auth')
      };
    } else {
      formattedError = {
        ...newError,
        source: newError.source || context,
        timestamp: newError.timestamp || Date.now()
      };
    }
    
    // Log the error
    console.error('[Audit Error]', formattedError);
    
    // Store the error
    setError(formattedError);
    
    // Display toast notification
    toast.error(formattedError.message, {
      description: context || formattedError.details?.substring(0, 100),
    });
    
    // For critical errors, activate mock mode if not already active
    if (formattedError.isCritical && !notionApi.mockMode.isActive()) {
      toast.info('Mode démonstration activé automatiquement', { 
        description: 'Suite à une erreur critique, des données fictives sont utilisées',
        action: {
          label: "Ok",
          onClick: () => {}
        }
      });
      
      notionApi.mockMode.activate();
      
      // For navigation errors, offer to return to home
      if (formattedError.message.includes('introuvable') || 
          formattedError.message.includes('not found')) {
        toast.error("Ressource non trouvée", {
          description: "Impossible de charger l'audit demandé",
          action: {
            label: "Retour à l'accueil",
            onClick: () => navigate('/')
          }
        });
      }
    }
    
    return formattedError;
  }, [navigate]);
  
  return {
    error,
    setError,
    handleError,
    clearError: useCallback(() => setError(null), []),
    hasError: !!error
  };
};
