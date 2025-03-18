
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './AuditContainer';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

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
          
          // Vérifier le format de la clé
          if (!apiKey.startsWith('secret_')) {
            console.error('Format de clé API incorrect. Clé actuelle:', apiKey.substring(0, 8) + '...');
            toast.error('Format de clé API incorrect', {
              description: 'La clé d\'intégration doit commencer par "secret_"',
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
          
          await notionApi.users.me(apiKey);
          console.log('Notion connection verified successfully');
          
          // Afficher un toast de succès
          toast.success('Connexion Notion établie', {
            description: 'L\'intégration avec Notion est active.'
          });
        }
      } catch (error) {
        console.error('Notion connection test failed:', error);
        toast.error("Problème de connexion à Notion", {
          description: "Vérifiez votre connexion internet ou reconfigurez l'intégration Notion.",
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
