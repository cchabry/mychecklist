
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { resetProxyCache, verifyProxyDeployment, STORAGE_KEYS } from '@/lib/notionProxy/config';

export const useNotionIntegration = () => {
  const [usingNotion, setUsingNotion] = useState(isNotionConfigured());
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  const [notionErrorDetails, setNotionErrorDetails] = useState({ 
    show: false, 
    error: '', 
    context: '' 
  });
  
  // Vérifier le mode mock et le proxy au démarrage
  useEffect(() => {
    const checkNotionSetup = async () => {
      // Vérifie si le forçage du mode réel a été demandé
      const forceReal = localStorage.getItem('notion_force_real') === 'true';
      if (forceReal) {
        console.log('🔄 useNotionIntegration: Mode réel forcé - Désactivation du mode mock');
        localStorage.removeItem('notion_force_real');
        localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
        notionApi.mockMode.deactivate();
      }
      
      // Si Notion est configuré, vérifier l'état du proxy
      if (usingNotion) {
        try {
          // Vérifier si le proxy est correctement déployé
          const proxyIsWorking = await verifyProxyDeployment(false);
          
          if (!proxyIsWorking) {
            console.warn('⚠️ Proxy Notion non opérationnel, activation du mode démo');
            // Si le proxy n'est pas opérationnel, activer le mode mock
            if (!notionApi.mockMode.isActive()) {
              notionApi.mockMode.activate();
              
              // Afficher une notification explicative
              toast.warning('Mode démonstration Notion activé', {
                description: 'Le proxy Notion n\'est pas accessible. L\'application utilise des données simulées.',
                duration: 6000,
                action: {
                  label: 'Détails',
                  onClick: () => setNotionErrorDetails({
                    show: true,
                    error: 'Problème de connexion au proxy Notion',
                    context: 'Le proxy n\'est pas correctement déployé ou configuré sur Vercel'
                  })
                }
              });
            }
          } else {
            // Le proxy fonctionne, désactiver le mode mock s'il est actif
            if (notionApi.mockMode.isActive() && !forceReal) {
              console.log('Proxy opérationnel, désactivation du mode mock');
              notionApi.mockMode.deactivate();
              toast.success('Connexion Notion rétablie', {
                description: 'L\'application utilise maintenant des données réelles depuis Notion'
              });
            } else {
              console.log('Proxy opérationnel, mode réel déjà actif');
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du proxy:', error);
          
          // En cas d'erreur, activer le mode mock pour sécuriser l'expérience
          if (!notionApi.mockMode.isActive() && !forceReal) {
            notionApi.mockMode.activate();
            toast.warning('Mode démonstration activé suite à une erreur', {
              description: 'Erreur de communication avec le proxy Notion. Données simulées activées.',
              action: {
                label: 'Forcer mode réel',
                onClick: () => {
                  localStorage.setItem('notion_force_real', 'true');
                  notionApi.mockMode.forceReset();
                  window.location.reload();
                }
              }
            });
          }
        }
      }
    };
    
    checkNotionSetup();
  }, [usingNotion]);
  
  const handleConnectNotionClick = () => {
    // Réinitialiser le cache du proxy avant d'ouvrir la configuration
    resetProxyCache();
    
    // Forcer le mode réel pour la configuration
    if (notionApi.mockMode.isActive()) {
      console.log('🔄 Désactivation du mode mock pour la configuration Notion');
      localStorage.setItem('notion_force_real', 'true');
      notionApi.mockMode.deactivate();
    }
    
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setUsingNotion(true);
    
    // Forcer le mode réel après une configuration réussie
    localStorage.setItem('notion_force_real', 'true');
    
    // Si le mode mock est actif, afficher un message explicatif
    if (notionApi.mockMode.isActive()) {
      toast.info('Notion configuré avec succès', {
        description: 'Les requêtes Notion passeront par un proxy pour contourner les limitations CORS.',
        duration: 5000,
        action: {
          label: 'Forcer mode réel',
          onClick: () => {
            notionApi.mockMode.forceReset();
            window.location.reload();
          }
        }
      });
    }
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
  };
  
  const showNotionError = (error: string, context?: string) => {
    setNotionErrorDetails({
      show: true,
      error,
      context: context || ''
    });
  };
  
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  const verifyNotionConnection = async (): Promise<boolean> => {
    if (!usingNotion) return false;
    
    try {
      const apiKey = localStorage.getItem('notion_api_key');
      if (!apiKey) return false;
      
      // Forcer le mode réel pour la vérification
      const wasInMockMode = notionApi.mockMode.isActive();
      if (wasInMockMode) {
        console.log('🔄 Désactivation temporaire du mode mock pour la vérification');
        localStorage.setItem('notion_force_real', 'true');
        notionApi.mockMode.deactivate();
      }
      
      // Vérifier d'abord le déploiement du proxy
      const proxyIsWorking = await verifyProxyDeployment(false);
      
      if (!proxyIsWorking) {
        console.warn('⚠️ Proxy Notion non opérationnel lors de la vérification');
        
        showNotionError(
          'Proxy Notion non opérationnel', 
          'Le fichier api/notion-proxy.ts n\'est pas correctement déployé ou configuré sur Vercel'
        );
        
        // Activer le mode mock pour sécuriser l'expérience mais uniquement si on n'a pas forcé le mode réel
        if (!localStorage.getItem('notion_force_real')) {
          notionApi.mockMode.activate();
          
          toast.warning('Mode démonstration activé', {
            description: 'Le proxy Notion n\'est pas accessible. L\'application utilise des données simulées.',
            duration: 6000,
            action: {
              label: 'Forcer mode réel',
              onClick: () => {
                localStorage.setItem('notion_force_real', 'true');
                notionApi.mockMode.forceReset();
                window.location.reload();
              }
            }
          });
        }
        
        return true; // Permettre l'utilisation en mode mock
      }
      
      // Tester l'API Notion maintenant que le proxy est vérifié
      try {
        await notionApi.users.me(apiKey);
        console.log('Connexion Notion vérifiée via proxy');
        
        // Si on était en mode mock et que ça fonctionne maintenant, désactiver le mode mock
        if (notionApi.mockMode.isActive()) {
          notionApi.mockMode.deactivate();
          toast.success('Connexion avec l\'API Notion établie', {
            description: 'Le mode démonstration a été désactivé, vous utilisez maintenant des données réelles.',
          });
        }
        
        return true;
      } catch (apiError) {
        console.error('Échec de la connexion à l\'API Notion:', apiError);
        
        if (apiError.message?.includes('401')) {
          // Erreur d'authentification - problème de clé API
          toast.error('Clé API Notion invalide', {
            description: 'Vérifiez votre clé d\'intégration dans les paramètres Notion.',
            action: {
              label: 'Configurer',
              onClick: () => {
                document.getElementById('notion-connect-button')?.click();
              }
            }
          });
          return false;
        } else {
          // Autre erreur d'API - activer le mode mock uniquement si on n'a pas forcé le mode réel
          showNotionError(
            'Erreur d\'accès à l\'API Notion',
            `Détail: ${apiError.message || 'Erreur inconnue'}`
          );
          
          if (!localStorage.getItem('notion_force_real')) {
            notionApi.mockMode.activate();
            toast.warning('Mode démonstration activé suite à une erreur', {
              description: 'L\'application utilisera des données de test pendant la résolution du problème.',
              action: {
                label: 'Forcer mode réel',
                onClick: () => {
                  localStorage.setItem('notion_force_real', 'true');
                  notionApi.mockMode.forceReset();
                  window.location.reload();
                }
              }
            });
          }
          
          return true; // Permettre l'utilisation en mode mock
        }
      }
    } catch (connectionError) {
      console.error('Échec de la vérification de la connexion Notion:', connectionError);
      
      // Gérer l'erreur CORS "Failed to fetch"
      if (connectionError.message?.includes('Failed to fetch')) {
        showNotionError(
          'Tentative de connexion via proxy en cours', 
          'Si les données réelles ne s\'affichent pas, le proxy Vercel n\'est pas encore configuré correctement.'
        );
        
        // Activer le mode mock et expliquer la situation, mais uniquement si on n'a pas forcé le mode réel
        if (!localStorage.getItem('notion_force_real')) {
          notionApi.mockMode.activate();
          
          toast.warning('Mode démonstration activé temporairement', {
            description: 'L\'application utilisera des données de test pendant la configuration du proxy.',
            duration: 6000,
            action: {
              label: 'Forcer mode réel',
              onClick: () => {
                localStorage.setItem('notion_force_real', 'true');
                notionApi.mockMode.forceReset();
                window.location.reload();
              }
            }
          });
        }
        
        return true; // Permettre l'utilisation en mode mock
      } else {
        toast.error('Erreur d\'accès à Notion', {
          description: 'Impossible de vérifier la connexion à Notion. Vérifiez votre configuration.',
          action: {
            label: 'Forcer mode réel',
            onClick: () => {
              localStorage.setItem('notion_force_real', 'true');
              notionApi.mockMode.forceReset();
              window.location.reload();
            }
          }
        });
        return false;
      }
    }
  };
  
  return {
    usingNotion,
    notionConfigOpen,
    notionErrorDetails,
    setUsingNotion,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose,
    showNotionError,
    hideNotionError,
    verifyNotionConnection
  };
};
