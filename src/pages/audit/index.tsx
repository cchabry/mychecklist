
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './AuditContainer';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { isOAuthToken, isIntegrationKey } from '@/lib/notionProxy/config';

const AuditPage = () => {
  const [notionReady, setNotionReady] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const checkNotionConfig = async () => {
      // Vérifier si on a forcé le mode réel pour une opération
      const forceReal = localStorage.getItem('notion_force_real') === 'true';
      if (forceReal) {
        console.log('📢 AuditPage: Mode réel forcé temporairement - nettoyage après usage');
        localStorage.removeItem('notion_force_real');
      }
      
      // Vérifier si le mode mock est actif
      const isMockActive = notionApi.mockMode.isActive();
      console.log(`📢 AuditPage: Mode mock ${isMockActive ? 'ACTIF' : 'INACTIF'} au démarrage`);
      
      // Vérifier si Notion est configuré
      const hasNotionConfig = isNotionConfigured();
      setNotionReady(hasNotionConfig);
      
      if (!hasNotionConfig) {
        console.log('⚠️ Notion n\'est pas configuré');
        toast.warning("Notion n'est pas configuré", {
          description: "Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
          duration: 5000,
        });
        
        // S'assurer que le mode mock est activé puisque Notion n'est pas configuré
        if (!isMockActive) {
          console.log('🔄 Activation du mode mock car Notion n\'est pas configuré');
          notionApi.mockMode.activate();
        }
        
        setChecking(false);
        return;
      }
      
      // Si configuré mais en mode mock, afficher un indicateur
      if (hasNotionConfig && isMockActive) {
        console.log('ℹ️ Notion est configuré mais le mode mock est actif');
        notionApi.mockMode.checkAndNotify();
        setChecking(false);
        return;
      }
      
      // Si configuré, tester la connexion
      try {
        const apiKey = localStorage.getItem('notion_api_key');
        if (apiKey) {
          console.log('🔑 Tentative de connexion avec la clé depuis localStorage:', apiKey.substring(0, 8) + '...');
          
          // Déterminer le type de token et ajouter un log
          const tokenType = isOAuthToken(apiKey) ? 'OAuth (ntn_)' : (isIntegrationKey(apiKey) ? 'Integration (secret_)' : 'Inconnu');
          console.log(`🔑 Type de clé API détecté: ${tokenType}`);
          
          // Vérifier le format de la clé - accepter les deux types
          if (!isOAuthToken(apiKey) && !isIntegrationKey(apiKey)) {
            console.error('❌ Format de clé API incorrect. Clé actuelle:', apiKey.substring(0, 8) + '...');
            toast.error('Format de clé API incorrect', {
              description: 'La clé doit commencer par "secret_" (intégration) ou "ntn_" (OAuth)',
              duration: 5000,
            });
            
            // Demander à l'utilisateur s'il souhaite effacer cette clé incorrecte
            toast.error('Clé API Notion incorrecte', {
              description: 'La clé actuelle n\'est pas au bon format. Souhaitez-vous la reconfigurer?',
              action: {
                label: 'Configurer',
                onClick: () => {
                  document.getElementById('notion-connect-button')?.click();
                }
              },
              duration: 10000,
            });
            
            // Activer le mode mock pour éviter les erreurs
            if (!isMockActive) {
              console.log('🔄 Activation du mode mock car format de clé API incorrect');
              notionApi.mockMode.activate();
            }
            
            setChecking(false);
            return;
          }
          
          // S'assurer que la clé est envoyée correctement
          const cleanKey = apiKey.trim();
          
          // Essayer de tester la connexion à Notion
          try {
            await notionApi.users.me(cleanKey);
            console.log('✅ Connexion Notion vérifiée avec succès');
            
            // Si on était en mode mock et que ça fonctionne, désactiver le mode mock
            if (isMockActive) {
              console.log('🔄 Désactivation du mode mock car la connexion fonctionne');
              notionApi.mockMode.deactivate();
              
              // Afficher une notification de connexion réussie
              toast.success('Connexion Notion établie', {
                description: `L'intégration avec Notion est maintenant active (${tokenType})`,
              });
            }
          } catch (testError) {
            console.error('❌ Test de connexion Notion échoué:', testError);
            
            // Activer le mode mock en cas d'erreur
            if (!isMockActive) {
              console.log('🔄 Activation du mode mock suite à une erreur de connexion');
              notionApi.mockMode.activate();
            }
            
            // Afficher une erreur selon le type
            if (testError.message?.includes('401')) {
              toast.error("Erreur d'authentification Notion", {
                description: "La clé d'API n'est pas valide. Mode démonstration activé.",
              });
            } else if (testError.message?.includes('Failed to fetch')) {
              toast.warning("Problème de connexion à l'API Notion", {
                description: "Mode démonstration activé pour contourner les limitations CORS.",
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de la configuration Notion:', error);
        
        // Activer le mode mock en cas d'erreur générale
        if (!isMockActive) {
          console.log('🔄 Activation du mode mock suite à une erreur générale');
          notionApi.mockMode.activate();
        }
        
        toast.error("Problème de connexion à Notion", {
          description: "Mode démonstration activé. Vérifiez votre connexion internet.",
          duration: 5000,
        });
      } finally {
        setChecking(false);
      }
    };
    
    checkNotionConfig();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-transparent border-tmw-teal rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuditContainer />;
};

export default AuditPage;
