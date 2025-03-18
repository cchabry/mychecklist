
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './AuditContainer';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notionService';
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
          await notionApi.users.me(apiKey);
          console.log('Notion connection verified successfully');
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
