
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { operationMode } from '@/services/operationMode';
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
    const isDemoActive = operationMode.isDemoMode;
    
    console.log('🔍 Vérification de la configuration Notion:', {
      'Notion configuré': hasConfig,
      'Mode démonstration actif': isDemoActive,
      'API Key': localStorage.getItem('notion_api_key') ? 'Définie' : 'Non définie',
      'Database ID': localStorage.getItem('notion_database_id') ? 'Défini' : 'Non défini'
    });
    
    if (!hasConfig) {
      console.log('⚠️ Notion n\'est pas configuré');
      setIsConnected(false);
      setIsLoading(false);
      return;
    }
    
    // Si on est en mode démonstration, on considère ça comme "non connecté"
    // car on n'utilise pas l'API Notion réelle
    if (isDemoActive) {
      console.log('📢 Mode démonstration actif - considéré comme non connecté à Notion');
      setIsConnected(false);
      setIsLoading(false);
      
      // Si une erreur existe dans le stockage, la récupérer
      const lastError = localStorage.getItem('notion_last_error');
      if (lastError) {
        try {
          const errorData = JSON.parse(lastError);
          setError(errorData.message || 'Erreur de connexion à Notion');
        } catch (e) {
          setError('Erreur de connexion à Notion');
        }
      }
      return;
    }
    
    try {
      // Tester la connexion si on n'est pas en mode démonstration
      const apiKey = localStorage.getItem('notion_api_key');
      if (apiKey) {
        console.log('🔑 Test de connexion avec clé API:', apiKey.substring(0, 8) + '...');
        
        // Utiliser le nouveau système pour tester la connexion
        // Cela va créer une requête temporaire en mode réel même si le mode démo est actif
        const wasMockMode = operationMode.isDemoMode;
        if (wasMockMode) {
          operationMode.enableRealMode(); // Forcer temporairement le mode réel pour ce test
        }
        
        // Importer dynamiquement notionApi pour éviter les dépendances cycliques
        const { notionApi } = await import('@/lib/notionProxy');
        
        // Tenter une connexion à l'API Notion
        await notionApi.users.me(apiKey);
        console.log('✅ Connexion Notion réussie!');
        
        // Si la connexion réussit, on nettoie les erreurs stockées
        localStorage.removeItem('notion_last_error');
        localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
        
        // Si on était en mode démo, on le restaure après le test
        if (wasMockMode) {
          operationMode.enableDemoMode('Mode restauré après test de connexion réussi');
        }
        
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError('Clé API manquante');
      }
    } catch (testError) {
      console.error('❌ Test de connexion Notion échoué:', testError);
      
      // Notifier le service de mode opérationnel de l'erreur
      operationMode.handleConnectionError(
        testError instanceof Error ? testError : new Error(String(testError)),
        'Test de connexion Notion'
      );
      
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
  
  // Gérer la réinitialisation du mode et tester à nouveau
  const handleResetAndTest = () => {
    // Utiliser le nouveau système pour réinitialiser le mode
    operationMode.enableRealMode();
    
    toast.success('Configuration réinitialisée', {
      description: 'Tentative de connexion en mode réel...'
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
