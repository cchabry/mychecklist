
import { useState, useCallback, useEffect } from 'react';
import { testNotionConnection } from '@/lib/notion/notionClient';
import { isNotionConfigured } from '@/lib/notion';
import { cache } from '@/lib/cache';

// Clé de cache pour le statut de connexion Notion
const NOTION_CONNECTION_STATUS_CACHE_KEY = 'notion_connection_status';

/**
 * Hook spécialisé pour vérifier et gérer l'état de la connexion à Notion
 */
export const useNotionConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si la configuration Notion est valide
  const checkNotionConfig = useCallback(async (forceCheck: boolean = false) => {
    // Vérifier si on doit forcer un nouveau test
    if (!forceCheck) {
      // Essayer de récupérer le statut depuis le cache
      const cachedStatus = cache.get(NOTION_CONNECTION_STATUS_CACHE_KEY);
      
      if (cachedStatus) {
        console.log('Utilisation du statut de connexion Notion depuis le cache');
        setIsConnected(cachedStatus.isConnected);
        setError(cachedStatus.error);
        setIsLoading(false);
        return cachedStatus.isConnected;
      }
    }
    
    // Si aucune configuration n'est présente, inutile de tester
    if (!isNotionConfigured()) {
      setIsConnected(false);
      setError('Configuration Notion manquante');
      setIsLoading(false);
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser la fonction testNotionConnection qui utilise la fonction Netlify
      const result = await testNotionConnection();
      
      if (result.success) {
        setIsConnected(true);
        setError(null);
        
        // Mettre en cache le statut positif
        cache.set(NOTION_CONNECTION_STATUS_CACHE_KEY, {
          isConnected: true,
          error: null,
          timestamp: Date.now()
        });
        
        return true;
      } else {
        setIsConnected(false);
        setError(result.error || 'Erreur de connexion à Notion');
        
        // Mettre en cache le statut négatif
        cache.set(NOTION_CONNECTION_STATUS_CACHE_KEY, {
          isConnected: false,
          error: result.error || 'Erreur de connexion à Notion',
          timestamp: Date.now()
        });
        
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Erreur lors de la vérification de la connexion Notion:', err);
      
      setIsConnected(false);
      setError(errorMessage);
      
      // Mettre en cache l'erreur
      cache.set(NOTION_CONNECTION_STATUS_CACHE_KEY, {
        isConnected: false,
        error: errorMessage,
        timestamp: Date.now()
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Réinitialiser et tester à nouveau
  const handleResetAndTest = useCallback(async () => {
    // Vider le cache
    cache.remove(NOTION_CONNECTION_STATUS_CACHE_KEY);
    
    // Forcer un nouveau test
    return checkNotionConfig(true);
  }, [checkNotionConfig]);
  
  // Vérifier la configuration au chargement initial
  useEffect(() => {
    checkNotionConfig();
  }, [checkNotionConfig]);
  
  return {
    isConnected,
    isLoading,
    error,
    checkNotionConfig,
    handleResetAndTest
  };
};

export default useNotionConnectionStatus;
