
import { useState, useEffect } from 'react';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

export const useNotionIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  
  // État pour les détails d'erreur
  const [notionErrorDetails, setNotionErrorDetails] = useState({
    show: false,
    error: '',
    context: ''
  });
  
  // Fonction pour vérifier la configuration Notion
  const checkNotionConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    // Vérifier si Notion est configuré
    const hasConfig = isNotionConfigured();
    const isMockMode = notionApi.mockMode.isActive();
    
    if (!hasConfig) {
      console.log('⚠️ Notion n\'est pas configuré');
      setIsConnected(false);
      setIsLoading(false);
      return;
    }
    
    // Si on est en mode mock, on considère ça comme "non connecté"
    if (isMockMode) {
      console.log('📢 Mode mock actif - considéré comme non connecté');
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
      // Tester la connexion si on n'est pas en mode mock
      const apiKey = localStorage.getItem('notion_api_key');
      if (apiKey) {
        console.log('🔑 Test de connexion avec clé API:', apiKey.substring(0, 8) + '...');
        
        // Tenter une connexion à l'API Notion
        await notionApi.users.me(apiKey);
        console.log('✅ Connexion Notion réussie!');
        
        // Si la connexion réussit, on nettoie les erreurs stockées
        localStorage.removeItem('notion_last_error');
        localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
        
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
  
  // Gérer l'ouverture de la configuration
  const handleConfigOpen = () => {
    setShowConfig(true);
  };
  
  // Gérer la fermeture de la configuration
  const handleConfigClose = () => {
    setShowConfig(false);
    // Revérifier après fermeture
    checkNotionConfig();
  };
  
  // Gérer l'ouverture des détails d'erreur
  const handleShowErrorDetails = () => {
    setShowErrorDetails(true);
  };
  
  // Gérer la fermeture des détails d'erreur
  const handleCloseErrorDetails = () => {
    setShowErrorDetails(false);
  };
  
  // Gérer la réinitialisation du mode mock et tester à nouveau
  const handleResetAndTest = () => {
    // Réinitialiser le mode mock
    notionApi.mockMode.forceReset();
    toast.success('Configuration réinitialisée', {
      description: 'Tentative de connexion en mode réel...'
    });
    
    // Effacer les erreurs stockées
    localStorage.removeItem('notion_last_error');
    
    // Vérifier à nouveau la configuration après un court délai
    setTimeout(() => {
      checkNotionConfig();
    }, 500);
  };
  
  // Fonctions ajoutées pour la compatibilité avec AuditContainer
  const handleConnectNotionClick = () => {
    setShowConfig(true);
  };
  
  const handleNotionConfigSuccess = () => {
    checkNotionConfig();
  };
  
  const handleNotionConfigClose = () => {
    setShowConfig(false);
    checkNotionConfig();
  };
  
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  // Calculer si on utilise Notion (configuré et connecté)
  const usingNotion = isConnected && isNotionConfigured();
  
  // Renommage de showConfig pour la compatibilité
  const notionConfigOpen = showConfig;
  
  return {
    isConnected,
    isLoading,
    showConfig,
    error,
    showErrorDetails,
    setShowConfig,
    setShowErrorDetails,
    handleConfigOpen,
    handleConfigClose,
    handleShowErrorDetails,
    handleCloseErrorDetails,
    handleResetAndTest,
    checkNotionConfig,
    // Propriétés et fonctions ajoutées pour la compatibilité avec AuditContainer
    usingNotion,
    notionConfigOpen,
    notionErrorDetails,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose,
    hideNotionError
  };
};
