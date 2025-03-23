
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types pour les opérations en file d'attente
export type OperationType = 'create' | 'update' | 'delete';
export type OperationStatus = 'pending' | 'processing' | 'success' | 'error';

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
  maxAttempts: number;
  error?: string;
}

interface OperationQueueState {
  operations: QueuedOperation[];
  isProcessing: boolean;
  lastSync: number | null;
}

// Clé de stockage pour la persistence
const QUEUE_STORAGE_KEY = 'operation-queue';
const AUTO_PROCESS_INTERVAL = 60000; // 1 minute

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
      if (state.operations.filter(op => op.status === 'pending').length > 0) {
        processQueue();
      }
    }, AUTO_PROCESS_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [state.operations]);
  
  /**
   * Ajoute une opération à la file d'attente
   */
  const addOperation = (
    entityType: string,
    operationType: OperationType,
    entityId?: string,
    payload?: any,
    maxAttempts: number = 3
  ): QueuedOperation => {
    const newOperation: QueuedOperation = {
      id: uuidv4(),
      entityType,
      operationType,
      entityId,
      payload,
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts
    };
    
    setState(prev => ({
      ...prev,
      operations: [...prev.operations, newOperation]
    }));
    
    return newOperation;
  };
  
  /**
   * Met à jour le statut d'une opération
   */
  const updateOperationStatus = (
    operationId: string,
    status: OperationStatus,
    error?: string
  ) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.map(op =>
        op.id === operationId
          ? {
              ...op,
              status,
              lastAttempt: Date.now(),
              attempts: op.attempts + (status === 'error' || status === 'processing' ? 1 : 0),
              error: error
            }
          : op
      )
    }));
  };
  
  /**
   * Supprime une opération de la file d'attente
   */
  const removeOperation = (operationId: string) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.id !== operationId)
    }));
  };
  
  /**
   * Traite les opérations en attente
   */
  const processQueue = async () => {
    const pendingOperations = state.operations.filter(
      op => op.status === 'pending' && op.attempts < op.maxAttempts
    );
    
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
        console.log(`Traitement de l'opération ${operation.id}:`, operation);
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En fonction du type d'entité et d'opération, appeler différents services
        // Par exemple:
        // if (operation.entityType === 'project') {
        //   if (operation.operationType === 'create') {
        //     await projectsService.create(operation.payload);
        //   } else if (operation.operationType === 'update') {
        //     await projectsService.update(operation.entityId, operation.payload);
        //   } else if (operation.operationType === 'delete') {
        //     await projectsService.delete(operation.entityId);
        //   }
        // }
        
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
        
        // Si le nombre maximal de tentatives est atteint, on laisse l'opération en erreur
        // Sinon, elle sera automatiquement réessayée plus tard
      }
    }
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: false,
      lastSync: Date.now()
    }));
  };
  
  /**
   * Réinitialise une opération en erreur pour qu'elle soit réessayée
   */
  const retryOperation = (operationId: string) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.map(op =>
        op.id === operationId && (op.status === 'error' || op.status === 'processing')
          ? { ...op, status: 'pending' }
          : op
      )
    }));
  };
  
  /**
   * Vide la file d'attente
   */
  const clearQueue = () => {
    setState({
      operations: [],
      isProcessing: false,
      lastSync: Date.now()
    });
  };
  
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
    errorCount: state.operations.filter(op => op.status === 'error').length
  };
}
