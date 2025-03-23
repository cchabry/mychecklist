
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types pour les opérations en file d'attente
export type OperationType = 'create' | 'update' | 'delete';
export type OperationStatus = 'pending' | 'processing' | 'success' | 'error';
export type RetryStrategy = 'immediate' | 'exponential' | 'linear' | 'fixed';

export interface RetryOptions {
  maxAttempts: number;
  retryStrategy: RetryStrategy;
  initialDelay: number;
  nextRetryTime?: string;
  backoffFactor?: number;
  maxDelay?: number;
  useJitter?: boolean;
}

export interface QueuedOperation {
  id: string;
  entityType: string; // 'project', 'audit', 'evaluation', etc.
  operationType: OperationType;
  entityId?: string; // Pour update/delete
  payload?: any; // Données pour create/update
  status: OperationStatus;
  createdAt: number;
  lastAttempt?: number;
  attempts: number;
  error?: string;
  
  // Options de retry
  maxAttempts: number;
  retryStrategy: RetryStrategy;
  initialDelay: number;
  nextRetryTime?: string;
  backoffFactor?: number;
  maxDelay?: number;
  useJitter?: boolean;
}

interface OperationQueueState {
  operations: QueuedOperation[];
  isProcessing: boolean;
  lastSync: number | null;
}

// Paramètres par défaut
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  retryStrategy: 'exponential',
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  useJitter: true
};

// Clé de stockage pour la persistence
const QUEUE_STORAGE_KEY = 'operation-queue';
const AUTO_PROCESS_INTERVAL = 60000; // 1 minute

/**
 * Calcule le délai pour la prochaine tentative selon la stratégie choisie
 */
function calculateRetryDelay(
  attempt: number,
  options: Partial<RetryOptions> = {}
): number {
  const {
    initialDelay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    retryStrategy = 'exponential',
    useJitter = true
  } = options;

  let delay: number;

  switch (retryStrategy) {
    case 'immediate':
      // Retry immédiatement
      delay = 0;
      break;
    
    case 'fixed':
      // Toujours le même délai
      delay = initialDelay;
      break;
    
    case 'linear':
      // Augmentation linéaire: initialDelay * attemptNumber
      delay = initialDelay * attempt;
      break;
    
    case 'exponential':
    default:
      // Backoff exponentiel: initialDelay * (backoffFactor ^ attemptNumber)
      delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
      break;
  }

  // Appliquer le délai maximum
  delay = Math.min(delay, maxDelay);

  // Ajouter un jitter aléatoire (±30%) pour éviter les tempêtes de requêtes
  if (useJitter) {
    const jitterFactor = 0.7 + Math.random() * 0.6; // Entre 0.7 et 1.3
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Hook pour gérer une file d'attente d'opérations persistante
 */
export function useOperationQueue() {
  const [state, setState] = useState<OperationQueueState>(() => {
    // Charger l'état initial depuis le stockage local
    try {
      const storedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        return JSON.parse(storedQueue);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la file d\'attente:', error);
    }
    
    // État par défaut
    return {
      operations: [],
      isProcessing: false,
      lastSync: null
    };
  });
  
  // Persistence de l'état
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la file d\'attente:', error);
    }
  }, [state]);
  
  // Traitement automatique des opérations en attente
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (state.operations.some(op => {
        // Vérifier si c'est le moment de retenter l'opération
        if (op.status === 'pending' && op.nextRetryTime) {
          const nextRetryTime = new Date(op.nextRetryTime).getTime();
          return Date.now() >= nextRetryTime;
        }
        return false;
      })) {
        processQueue();
      }
    }, 5000); // Vérifier toutes les 5 secondes
    
    return () => clearInterval(intervalId);
  }, [state.operations]);
  
  /**
   * Ajoute une opération à la file d'attente
   */
  const addOperation = useCallback((
    entityType: string,
    operationType: OperationType,
    entityId?: string,
    payload?: any,
    retryOptions: Partial<RetryOptions> = {}
  ): QueuedOperation => {
    const options = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
    
    // Si nextRetryTime n'est pas défini, le calculer
    if (!options.nextRetryTime) {
      const nextRetryDelay = calculateRetryDelay(1, options);
      options.nextRetryTime = new Date(Date.now() + nextRetryDelay).toISOString();
    }
    
    const newOperation: QueuedOperation = {
      id: uuidv4(),
      entityType,
      operationType,
      entityId,
      payload,
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0,
      // Options de retry
      maxAttempts: options.maxAttempts,
      retryStrategy: options.retryStrategy,
      initialDelay: options.initialDelay,
      nextRetryTime: options.nextRetryTime,
      backoffFactor: options.backoffFactor,
      maxDelay: options.maxDelay,
      useJitter: options.useJitter
    };
    
    setState(prev => ({
      ...prev,
      operations: [...prev.operations, newOperation]
    }));
    
    console.log(`Opération ${newOperation.id} ajoutée à la file d'attente (${newOperation.entityType}.${newOperation.operationType})`);
    
    return newOperation;
  }, []);
  
  /**
   * Met à jour le statut d'une opération et calcule le prochain délai de retry
   */
  const updateOperationStatus = useCallback((
    operationId: string,
    status: OperationStatus,
    error?: string
  ) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.map(op => {
        if (op.id !== operationId) return op;
        
        const updatedOp = {
          ...op,
          status,
          lastAttempt: Date.now(),
          attempts: op.attempts + (status === 'error' || status === 'processing' ? 1 : 0),
          error
        };
        
        // Si l'opération est en erreur et peut être retentée, calculer le prochain délai
        if (status === 'error' && updatedOp.attempts < updatedOp.maxAttempts) {
          const nextRetryDelay = calculateRetryDelay(updatedOp.attempts + 1, {
            initialDelay: updatedOp.initialDelay,
            backoffFactor: updatedOp.backoffFactor,
            maxDelay: updatedOp.maxDelay,
            retryStrategy: updatedOp.retryStrategy,
            useJitter: updatedOp.useJitter
          });
          
          updatedOp.nextRetryTime = new Date(Date.now() + nextRetryDelay).toISOString();
          console.log(`Opération ${operationId} sera retentée dans ${nextRetryDelay/1000}s (tentative ${updatedOp.attempts}/${updatedOp.maxAttempts})`);
        }
        
        return updatedOp;
      })
    }));
  }, []);
  
  /**
   * Supprime une opération de la file d'attente
   */
  const removeOperation = useCallback((operationId: string) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.id !== operationId)
    }));
  }, []);
  
  /**
   * Traite les opérations en attente
   */
  const processQueue = useCallback(async () => {
    const pendingOperations = state.operations.filter(op => {
      if (op.status !== 'pending') return false;
      
      // Vérifier si c'est le moment de retenter l'opération
      if (op.nextRetryTime) {
        const nextRetryTime = new Date(op.nextRetryTime).getTime();
        return Date.now() >= nextRetryTime;
      }
      
      return true;
    });
    
    if (pendingOperations.length === 0 || state.isProcessing) {
      return;
    }
    
    setState(prev => ({ ...prev, isProcessing: true }));
    
    for (const operation of pendingOperations) {
      // Marquer l'opération comme en cours de traitement
      updateOperationStatus(operation.id, 'processing');
      
      try {
        // Ici, nous simulons le traitement réel de l'opération
        // Dans une implémentation réelle, vous appelleriez le service approprié
        console.log(`Traitement de l'opération ${operation.id} (${operation.entityType}.${operation.operationType})`, 
          operation.entityId ? `ID: ${operation.entityId}` : 'Nouvelle entité');
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuler un succès ou un échec aléatoire pour les tests
        const success = Math.random() > 0.3; // 70% de chance de succès
        
        if (!success) {
          throw new Error('Erreur simulée pour tester le mécanisme de retry');
        }
        
        // Marquer l'opération comme réussie
        updateOperationStatus(operation.id, 'success');
        
        // Après un certain délai, supprimer les opérations réussies
        setTimeout(() => {
          removeOperation(operation.id);
        }, 5000);
      } catch (error) {
        console.error(`Erreur lors du traitement de l'opération ${operation.id}:`, error);
        
        // Marquer l'opération comme en erreur
        updateOperationStatus(
          operation.id,
          'error',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: false,
      lastSync: Date.now()
    }));
  }, [state.operations, state.isProcessing, updateOperationStatus, removeOperation]);
  
  /**
   * Réinitialise une opération en erreur pour qu'elle soit réessayée immédiatement
   */
  const retryOperation = useCallback((operationId: string) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.map(op => {
        if (op.id === operationId && (op.status === 'error' || op.status === 'processing')) {
          // Forcer une tentative immédiate
          return { 
            ...op, 
            status: 'pending',
            nextRetryTime: new Date().toISOString()
          };
        }
        return op;
      })
    }));
    
    // Démarrer le traitement immédiatement
    setTimeout(() => processQueue(), 0);
  }, [processQueue]);
  
  /**
   * Vide la file d'attente
   */
  const clearQueue = useCallback(() => {
    setState({
      operations: [],
      isProcessing: false,
      lastSync: Date.now()
    });
  }, []);
  
  return {
    operations: state.operations,
    isProcessing: state.isProcessing,
    lastSync: state.lastSync,
    addOperation,
    updateOperationStatus,
    removeOperation,
    processQueue,
    retryOperation,
    clearQueue,
    pendingCount: state.operations.filter(op => op.status === 'pending').length,
    errorCount: state.operations.filter(op => op.status === 'error').length,
    successCount: state.operations.filter(op => op.status === 'success').length
  };
}
