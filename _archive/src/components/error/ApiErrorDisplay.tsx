
import React from 'react';
import { ApiErrorDetails, ApiErrorType } from '@/hooks/api/useErrorCategorization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle, WifiOff, ShieldAlert, FileWarning, Clock } from 'lucide-react';

interface ApiErrorDisplayProps {
  error: ApiErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  onRecover?: () => void;
  compact?: boolean;
}

/**
 * Composant pour afficher les erreurs d'API avec des actions de récupération
 */
const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  onRecover,
  compact = false
}) => {
  const getErrorIcon = (type: ApiErrorType) => {
    switch (type) {
      case 'connection':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      case 'authentication':
      case 'authorization':
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case 'timeout':
      case 'rate_limit':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'not_found':
        return <FileWarning className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getErrorTitle = (type: ApiErrorType) => {
    switch (type) {
      case 'connection':
        return 'Problème de connexion';
      case 'authentication':
        return 'Problème d\'authentification';
      case 'authorization':
        return 'Problème de permissions';
      case 'validation':
        return 'Données invalides';
      case 'not_found':
        return 'Ressource introuvable';
      case 'conflict':
        return 'Conflit de données';
      case 'rate_limit':
        return 'Limite de requêtes atteinte';
      case 'server':
        return 'Erreur serveur';
      case 'timeout':
        return 'Délai d\'attente dépassé';
      case 'parse':
        return 'Erreur de données';
      case 'business':
        return 'Erreur métier';
      default:
        return 'Erreur inattendue';
    }
  };
  
  // Version compacte pour affichage en ligne
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
        {getErrorIcon(error.type)}
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">
            {getErrorTitle(error.type)}
          </h4>
          <p className="text-xs text-red-700 mt-1">
            {error.message}
          </p>
        </div>
        <div className="flex gap-2">
          {error.retryable && onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          )}
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={onDismiss}
            >
              Fermer
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Version complète avec carte
  return (
    <Card className="border-red-200">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {getErrorIcon(error.type)}
          <CardTitle className="text-base">
            {getErrorTitle(error.type)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>{error.message}</p>
        
        {error.statusCode && (
          <div className="bg-slate-50 p-2 rounded text-xs text-muted-foreground">
            Code: {error.statusCode}
          </div>
        )}
        
        {error.details && (
          <div className="bg-slate-50 p-2 rounded text-xs overflow-auto max-h-24">
            <pre>{JSON.stringify(error.details, null, 2)}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {onDismiss && (
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Fermer
          </Button>
        )}
        <div className="space-x-2">
          {error.recoverable && onRecover && (
            <Button size="sm" variant="secondary" onClick={onRecover}>
              Réparer
            </Button>
          )}
          {error.retryable && onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApiErrorDisplay;
