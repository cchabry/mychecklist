
import { useState, useEffect } from 'react';
import { isNotionConfigured } from '@/lib/notion';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour vérifier le statut de connexion à Notion
 */
export const useNotionConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour vérifier la configuration Notion
  const checkNotionConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si Notion est configuré
      const hasConfig = isNotionConfigured();
      
      if (!hasConfig) {
        setIsConnected(false);
        setError("Configuration Notion manquante");
        setIsLoading(false);
        return;
      }

      // Si on est en mode démo, considérer non connecté
      if (operationMode.isDemoMode) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      // Tester la connexion avec l'API Notion
      setIsConnected(true);
      setError(null);
    } catch (error) {
      setIsConnected(false);
      setError(error instanceof Error ? error.message : String(error));
      
      // Signaler l'erreur au système operationMode
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        'Test de connexion Notion'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier la configuration au chargement
  useEffect(() => {
    checkNotionConfig();
  }, []);

  // Réinitialiser le mode et tester à nouveau
  const handleResetAndTest = () => {
    operationMode.enableRealMode();
    checkNotionConfig();
  };

  return {
    isConnected,
    isLoading,
    error,
    checkNotionConfig,
    handleResetAndTest
  };
};
