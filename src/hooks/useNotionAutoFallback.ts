
import { useState, useEffect, useCallback } from 'react';
import { operationMode, OperationMode } from '@/services/operationMode';
import { toast } from 'sonner';

interface UseNotionAutoFallbackOptions {
  // Nombre maximal de tentatives avant fallback
  maxRetries?: number;
  // Intervalle entre les tentatives (ms)
  retryInterval?: number;
  // Notification lors du fallback
  notifyOnFallback?: boolean;
  // Mode de démarrage forcé (prioritaire sur la détection)
  forcedStartMode?: OperationMode;
}

/**
 * Hook pour la gestion automatique du fallback Notion
 * Détecte les erreurs et bascule automatiquement en mode démo si nécessaire
 */
export function useNotionAutoFallback(options: UseNotionAutoFallbackOptions = {}) {
  const {
    maxRetries = 3,
    retryInterval = 5000,
    notifyOnFallback = true,
    forcedStartMode
  } = options;
  
  const [retryCount, setRetryCount] = useState(0);
  const [isConnectionTested, setIsConnectionTested] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');
  
  /**
   * Teste la connexion à Notion
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    // Si un mode de démarrage est forcé, l'utiliser sans test
    if (forcedStartMode) {
      if (forcedStartMode === OperationMode.DEMO) {
        operationMode.enableDemoMode('Mode forcé au démarrage');
      } else if (forcedStartMode === OperationMode.REAL) {
        operationMode.enableRealMode();
      }
      setConnectionStatus(forcedStartMode === OperationMode.REAL ? 'success' : 'error');
      setIsConnectionTested(true);
      return forcedStartMode === OperationMode.REAL;
    }
    
    // Si nous sommes déjà en mode démo, pas besoin de tester
    if (operationMode.isDemoMode()) {
      setConnectionStatus('error');
      setIsConnectionTested(true);
      return false;
    }
    
    try {
      // Récupérer la clé API depuis localStorage
      const apiKey = localStorage.getItem('notion_api_key');
      if (!apiKey) {
        throw new Error('Clé API Notion manquante');
      }
      
      // Tester la connexion en faisant une requête à l'API Users
      // Cette requête devrait être très légère et rapide
      const userResponse = await fetch('https://api.notion.com/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28'
        }
      });
      
      if (!userResponse.ok) {
        throw new Error(`Erreur API Notion: ${userResponse.status}`);
      }
      
      // Connexion réussie !
      setConnectionStatus('success');
      setIsConnectionTested(true);
      operationMode.handleSuccessfulOperation();
      return true;
    } catch (error) {
      // Erreur de connexion
      setConnectionStatus('error');
      setIsConnectionTested(true);
      
      // Notifier le service de mode
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)), 
        'Test de connexion initial'
      );
      
      // Incrémenter le compteur de tentatives
      setRetryCount(prev => prev + 1);
      
      return false;
    }
  }, [forcedStartMode]);
  
  /**
   * Fonction de gestion du fallback automatique
   */
  const handleAutoFallback = useCallback(async () => {
    // Tester la connexion
    const connected = await testConnection();
    
    // Si la connexion échoue et qu'on a atteint le nombre max de tentatives
    if (!connected && retryCount >= maxRetries) {
      // Basculer en mode démo
      operationMode.enableDemoMode('Échecs répétés de connexion');
      
      // Notifier l'utilisateur
      if (notifyOnFallback) {
        toast.info('Mode démonstration activé automatiquement', {
          description: 'Impossible de se connecter à Notion après plusieurs tentatives',
          duration: 5000
        });
      }
    }
  }, [testConnection, retryCount, maxRetries, notifyOnFallback]);
  
  // Tester la connexion au montage du composant
  useEffect(() => {
    if (!isConnectionTested) {
      handleAutoFallback();
    }
  }, [isConnectionTested, handleAutoFallback]);
  
  // Planifier des tentatives si nécessaire
  useEffect(() => {
    // Si la connexion est en erreur mais qu'on n'a pas atteint le nombre max de tentatives
    if (connectionStatus === 'error' && retryCount < maxRetries && !operationMode.isDemoMode()) {
      // Planifier une nouvelle tentative
      const timer = setTimeout(() => {
        testConnection();
      }, retryInterval);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, retryCount, maxRetries, retryInterval, testConnection]);
  
  return {
    isConnectionTested,
    connectionStatus,
    retryCount,
    maxRetries,
    testConnection,
    operationMode: operationMode.getMode()
  };
}
