
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notionService } from '@/services/notion/notionService';
import { toast } from 'sonner';

/**
 * Composant qui redirige vers la page de configuration Notion si nécessaire
 */
const NotionConfigRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Ne pas rediriger si on est déjà sur la page de configuration
    if (location.pathname === '/notion-config') {
      return;
    }
    
    // Vérifier si Notion est configuré ou en mode démo
    const isConfigured = notionService.isConfigured();
    const isMockMode = notionService.isMockMode();
    
    if (!isConfigured && !isMockMode) {
      toast.info('Configuration Notion requise', {
        description: 'Veuillez configurer Notion pour utiliser l\'application'
      });
      navigate('/notion-config');
    }
  }, [navigate, location.pathname]);
  
  return null;
};

export default NotionConfigRedirect;
