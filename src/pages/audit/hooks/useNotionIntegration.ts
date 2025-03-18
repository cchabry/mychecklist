
import { useState } from 'react';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

export const useNotionIntegration = () => {
  const [usingNotion, setUsingNotion] = useState(isNotionConfigured());
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  
  const handleConnectNotionClick = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setUsingNotion(true);
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
  };
  
  const verifyNotionConnection = async (): Promise<boolean> => {
    if (!usingNotion) return false;
    
    try {
      const apiKey = localStorage.getItem('notion_api_key');
      if (!apiKey) return false;
      
      await notionApi.users.me(apiKey);
      console.log('Notion connection verified via proxy');
      return true;
    } catch (error) {
      console.error('Notion connection verification failed:', error);
      toast.error('Erreur d\'accès à Notion', {
        description: 'Impossible de vérifier la connexion à Notion. Vérifiez votre configuration.',
      });
      return false;
    }
  };
  
  return {
    usingNotion,
    notionConfigOpen,
    setUsingNotion,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose,
    verifyNotionConnection
  };
};
