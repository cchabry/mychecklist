
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
      // Vérifier si Notion est configuré
      const hasNotionConfig = isNotionConfigured();
      setNotionReady(hasNotionConfig);
      
      if (!hasNotionConfig) {
        toast.warning("Notion n'est pas configuré", {
          description: "Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
          duration: 5000,
        });
        setChecking(false);
        return;
      }
      
      // Si configuré, tester la connexion
      try {
        const apiKey = localStorage.getItem('notion_api_key');
        if (apiKey) {
          console.log('Tentative de connexion avec la clé depuis localStorage:', apiKey.substring(0, 8) + '...');
          
          // Déterminer le type de token et ajouter un log
          const tokenType = isOAuthToken(apiKey) ? 'OAuth (ntn_)' : (isIntegrationKey(apiKey) ? 'Integration (secret_)' : 'Inconnu');
          console.log(`Type de clé API détecté: ${tokenType}`);
          
          // Vérifier le format de la clé - accepter les deux types
          if (!isOAuthToken(apiKey) && !isIntegrationKey(apiKey)) {
            console.error('Format de clé API incorrect. Clé actuelle:', apiKey.substring(0, 8) + '...');
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
            
            setChecking(false);
            return;
          }
          
          // S'assurer que la clé est envoyée correctement
          const cleanKey = apiKey.trim();
          
          await notionApi.users.me(cleanKey);
          console.log('Notion connection verified successfully');
          
          // Afficher un toast de succès avec mention du type de token
          toast.success('Connexion Notion établie', {
            description: `L'intégration avec Notion est active (${tokenType})`,
          });
        }
      } catch (error) {
        console.error('Notion connection test failed:', error);
        
        // Vérifier si c'est une erreur d'authentification 401
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        const is401Error = errorMessage.includes('401');
        
        if (is401Error) {
          toast.error("Erreur d'authentification Notion", {
            description: "La clé d'API fournie n'est pas valide ou a expiré. Veuillez reconfigurer Notion.",
            action: {
              label: 'Reconfigurer',
              onClick: () => {
                document.getElementById('notion-connect-button')?.click();
              }
            },
            duration: 10000,
          });
        } else {
          toast.error("Problème de connexion à Notion", {
            description: "Vérifiez votre connexion internet ou reconfigurez l'intégration Notion.",
            duration: 5000,
          });
        }
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
