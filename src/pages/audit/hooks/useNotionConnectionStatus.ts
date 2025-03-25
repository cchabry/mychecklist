
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

/**
 * Hook pour vérifier et gérer le statut de connexion Notion
 */
export const useNotionConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour vérifier la configuration Notion
  const checkNotionConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    // Vérifier si Notion est configuré
    const hasConfig = isNotionConfigured();
    
    console.log('🔍 Vérification de la configuration Notion:', {
      'Notion configuré': hasConfig,
      'API Key': localStorage.getItem('notion_api_key') ? 'Définie' : 'Non définie',
      'Database ID': localStorage.getItem('notion_database_id') ? 'Défini' : 'Non défini'
    });
    
    if (!hasConfig) {
      console.log('⚠️ Notion n\'est pas configuré');
      setIsConnected(false);
      setIsLoading(false);
      return;
    }
    
    try {
      // Tester la connexion via la fonction Netlify
      const apiKey = localStorage.getItem('notion_api_key');
      if (apiKey) {
        console.log('🔑 Test de connexion avec clé API via Netlify:', apiKey.substring(0, 8) + '...');
        
        // Utiliser la fonction Netlify pour tester la connexion
        const response = await fetch('/.netlify/functions/notion-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: '/users/me',
            method: 'GET',
            token: apiKey
          })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${await response.text()}`);
        }
        
        // Si la fonction répond correctement, la connexion est établie
        console.log('✅ Connexion Notion réussie via fonction Netlify!');
        
        // Si la connexion réussit, on nettoie les erreurs stockées
        localStorage.removeItem('notion_last_error');
        
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError('Clé API manquante');
      }
    } catch (testError) {
      console.error('❌ Test de connexion Notion échoué:', testError);
      
      // Stocker l'erreur pour référence future
      try {
        localStorage.setItem('notion_last_error', JSON.stringify({
          timestamp: Date.now(),
          message: testError.message || 'Erreur de connexion à Notion'
        }));
      } catch (e) {
        // Ignorer les erreurs de JSON.stringify
      }
      
      setIsConnected(false);
      setError(testError.message || 'Erreur de connexion à Notion');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Vérifier la configuration au chargement
  useEffect(() => {
    checkNotionConfig();
  }, []);
  
  // Gérer la réinitialisation et tester à nouveau
  const handleResetAndTest = () => {
    toast.success('Configuration réinitialisée', {
      description: 'Tentative de connexion...'
    });
    
    // Effacer les erreurs stockées
    localStorage.removeItem('notion_last_error');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    
    // Vérifier à nouveau la configuration après un court délai
    setTimeout(() => {
      checkNotionConfig();
    }, 500);
  };
  
  return {
    isConnected,
    isLoading,
    error,
    checkNotionConfig,
    handleResetAndTest
  };
};
