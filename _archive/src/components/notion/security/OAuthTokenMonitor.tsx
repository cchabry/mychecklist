
import React, { useEffect, useState } from 'react';
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';
import OAuthReauthDialog from './OAuthReauthDialog';
import { NotionTokenType } from '@/services/notion/security/tokenValidation';

interface OAuthTokenMonitorProps {
  // Délai avant expiration pour montrer le dialogue (en ms)
  warningThreshold?: number;
  
  // Callback après un rafraîchissement réussi
  onTokenRefreshed?: () => void;
  
  // Désactiver le monitoring
  disabled?: boolean;
}

/**
 * Composant pour surveiller l'état du token OAuth et gérer la réauthentification
 */
const OAuthTokenMonitor: React.FC<OAuthTokenMonitorProps> = ({
  warningThreshold = 15 * 60 * 1000, // 15 minutes par défaut
  onTokenRefreshed,
  disabled = false
}) => {
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  
  // Utiliser le hook OAuth
  const { 
    isAuthenticated, 
    tokenType, 
    expiresAt, 
    tokenWillExpireSoon 
  } = useNotionOAuth({
    autoRefresh: true,
    onTokenRefreshed: () => {
      if (onTokenRefreshed) onTokenRefreshed();
    }
  });
  
  // Vérifier périodiquement si le token approche de l'expiration
  useEffect(() => {
    if (disabled || !isAuthenticated || tokenType !== NotionTokenType.OAUTH) {
      return;
    }
    
    const checkExpiration = () => {
      if (!expiresAt) return;
      
      const now = new Date();
      const timeUntilExpiration = expiresAt.getTime() - now.getTime();
      
      // Si le token expire bientôt (dans moins que le seuil d'avertissement)
      if (timeUntilExpiration < warningThreshold) {
        setShowReauthDialog(true);
      }
    };
    
    // Vérifier immédiatement
    checkExpiration();
    
    // Puis vérifier périodiquement
    const interval = setInterval(checkExpiration, 60000); // Toutes les minutes
    
    return () => clearInterval(interval);
  }, [disabled, isAuthenticated, tokenType, expiresAt, warningThreshold]);
  
  // Montrer le dialogue si le token est expiré ou va bientôt expirer
  useEffect(() => {
    if (tokenWillExpireSoon && isAuthenticated && tokenType === NotionTokenType.OAUTH) {
      setShowReauthDialog(true);
    }
  }, [tokenWillExpireSoon, isAuthenticated, tokenType]);
  
  // Si ce n'est pas un token OAuth ou si le monitoring est désactivé, ne rien afficher
  if (disabled || !isAuthenticated || tokenType !== NotionTokenType.OAUTH) {
    return null;
  }
  
  return (
    <OAuthReauthDialog
      isOpen={showReauthDialog}
      onClose={() => setShowReauthDialog(false)}
      tokenExpiresAt={expiresAt}
      onReauthSuccess={() => {
        if (onTokenRefreshed) onTokenRefreshed();
      }}
    />
  );
};

export default OAuthTokenMonitor;
