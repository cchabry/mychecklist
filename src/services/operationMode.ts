
/**
 * Service pour gérer le mode d'opération (réel vs démo)
 * Remplace l'ancien système mockMode avec une approche plus robuste
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { notionApiService } from './notion/notionApiService';
import { notionErrorService } from './notion/errorHandling';
import { NotionErrorType } from './notion/types/unified';

// Clé de stockage local pour le mode d'opération
const OPERATION_MODE_KEY = 'notion_operation_mode';

// Types de modes d'opération
export enum OperationMode {
  REAL = 'real',   // Mode réel (utilise l'API Notion)
  DEMO = 'demo'    // Mode démo (utilise des données fictives)
}

/**
 * Hook pour gérer le mode d'opération
 */
export function useOperationMode() {
  // État local du mode
  const [operationMode, setOperationMode] = useState<OperationMode>(() => {
    // Récupérer le mode depuis localStorage ou utiliser le mode réel par défaut
    const savedMode = localStorage.getItem(OPERATION_MODE_KEY);
    
    // Récupérer l'état du mockMode pour la compatibilité
    const isMockActive = notionApiService.mockMode.isActive();
    
    if (isMockActive) {
      return OperationMode.DEMO;
    }
    
    return savedMode === OperationMode.DEMO 
      ? OperationMode.DEMO 
      : OperationMode.REAL;
  });
  
  // État de la connexion
  const [connectionState, setConnectionState] = useState({
    lastError: null as Error | null,
    lastSuccess: null as Date | null,
    consecutiveErrors: 0,
    healthyConnection: true
  });
  
  // Mettre à jour le mode dans localStorage et mockMode
  useEffect(() => {
    localStorage.setItem(OPERATION_MODE_KEY, operationMode);
    
    // Synchroniser avec l'ancien système mockMode
    if (operationMode === OperationMode.DEMO) {
      notionApiService.mockMode.enable();
    } else {
      notionApiService.mockMode.disable();
    }
  }, [operationMode]);
  
  /**
   * Active le mode démo
   */
  const enableDemoMode = useCallback((reason: string = 'Activé manuellement') => {
    setOperationMode(OperationMode.DEMO);
    console.log(`Mode démo activé: ${reason}`);
    
    // Vérifier si le toast doit être affiché
    const shouldShowToast = reason !== 'initial' && reason !== 'silent';
    
    if (shouldShowToast) {
      toast.success('Mode démonstration activé', {
        description: reason
      });
    }
  }, []);
  
  /**
   * Active le mode réel
   */
  const enableRealMode = useCallback(() => {
    setOperationMode(OperationMode.REAL);
    console.log('Mode réel activé');
    toast.success('Mode réel activé', {
      description: 'Utilisation de l\'API Notion réelle'
    });
  }, []);
  
  /**
   * Bascule entre les modes
   */
  const toggleMode = useCallback(() => {
    if (operationMode === OperationMode.REAL) {
      enableDemoMode('Basculement manuel');
    } else {
      enableRealMode();
    }
  }, [operationMode, enableDemoMode, enableRealMode]);
  
  /**
   * Gère une erreur de connexion
   */
  const handleConnectionError = useCallback((error: Error, context: string = 'API Notion') => {
    // Mettre à jour l'état de connexion
    setConnectionState(prev => ({
      ...prev,
      lastError: error,
      consecutiveErrors: prev.consecutiveErrors + 1,
      healthyConnection: prev.consecutiveErrors < 3
    }));
    
    // Signaler l'erreur au service d'erreurs
    notionErrorService.reportError(error, context);
    
    // Si trop d'erreurs consécutives, passer en mode démo
    if (connectionState.consecutiveErrors >= 3 && operationMode === OperationMode.REAL) {
      enableDemoMode('Trop d\'erreurs de connexion consécutives');
    }
  }, [connectionState.consecutiveErrors, operationMode, enableDemoMode]);
  
  /**
   * Signale une opération réussie
   */
  const handleSuccessfulOperation = useCallback(() => {
    setConnectionState({
      lastError: null,
      lastSuccess: new Date(),
      consecutiveErrors: 0,
      healthyConnection: true
    });
  }, []);
  
  /**
   * Force temporairement le mode réel pour une opération spécifique
   */
  const useRealModeTemporarily = useCallback(() => {
    if (operationMode === OperationMode.DEMO) {
      notionApiService.mockMode.temporarilyForceReal();
      return true;
    }
    return false;
  }, [operationMode]);
  
  /**
   * Restaure le mode précédent après useRealModeTemporarily
   */
  const restoreMode = useCallback(() => {
    notionApiService.mockMode.restoreAfterForceReal();
  }, []);
  
  return {
    // États
    currentMode: operationMode,
    isRealMode: operationMode === OperationMode.REAL,
    isDemoMode: operationMode === OperationMode.DEMO,
    connectionHealth: connectionState,
    
    // Actions
    enableDemoMode,
    enableRealMode,
    toggleMode,
    handleConnectionError,
    handleSuccessfulOperation,
    useRealModeTemporarily,
    restoreMode
  };
}

export default useOperationMode;
