
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';

interface OAuthReauthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tokenExpiresAt?: Date | null;
  onReauthSuccess?: () => void;
}

/**
 * Composant pour gérer la réauthentification OAuth
 */
const OAuthReauthDialog: React.FC<OAuthReauthDialogProps> = ({
  isOpen,
  onClose,
  tokenExpiresAt,
  onReauthSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshToken, startOAuthFlow, logout } = useNotionOAuth({
    onTokenRefreshed: () => {
      if (onReauthSuccess) onReauthSuccess();
      onClose();
    }
  });
  
  // Formater le temps d'expiration
  const formatExpirationTime = () => {
    if (!tokenExpiresAt) return 'N/A';
    
    const now = new Date();
    const diff = tokenExpiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expiré';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`;
    }
    
    return `${minutes}min`;
  };
  
  // Rafraîchir le token
  const handleRefreshToken = async () => {
    setIsLoading(true);
    try {
      await refreshToken();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Démarrer un nouveau flux d'authentification
  const handleNewAuthentication = () => {
    setIsLoading(true);
    try {
      startOAuthFlow();
    } catch (e) {
      setIsLoading(false);
    }
  };
  
  // Se déconnecter
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Déterminer si le token est expiré
  const isTokenExpired = tokenExpiresAt && new Date() > tokenExpiresAt;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {isTokenExpired ? 'Token Notion expiré' : 'Session Notion expire bientôt'}
          </DialogTitle>
          <DialogDescription>
            {isTokenExpired
              ? 'Votre session Notion a expiré. Vous devez vous réauthentifier pour continuer à accéder à vos données Notion.'
              : 'Votre session Notion va bientôt expirer. Rafraîchissez votre token pour éviter toute interruption de service.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm">
              <div className="font-medium text-amber-800">Informations de session</div>
              <div className="text-amber-700 mt-1">
                {isTokenExpired 
                  ? 'Token expiré depuis ' + formatExpirationTime().replace('Expiré', 'quelque temps')
                  : 'Expire dans : ' + formatExpirationTime()}
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              {isTokenExpired
                ? 'Vous pouvez soit vous reconnecter avec Notion, soit rafraîchir votre session actuelle.'
                : 'Vous pouvez rafraîchir votre token maintenant ou vous reconnecter si le rafraîchissement échoue.'}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleNewAuthentication}
            disabled={isLoading}
            className="w-full sm:w-auto order-2"
          >
            Nouvelle connexion
          </Button>
          
          <Button
            onClick={handleRefreshToken}
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-3"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Rafraîchir le token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OAuthReauthDialog;
