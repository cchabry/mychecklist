
import React from 'react';
import {
  NotionErrorType,
  NotionError
} from '@/services/notion/types/unified';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle, WifiOff, ShieldAlert, FileWarning, Clock } from 'lucide-react';

export type ApiErrorType = 
  | 'connection'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'server'
  | 'timeout'
  | 'parse'
  | 'business'
  | 'unknown';

export interface ApiErrorDetails {
  type: ApiErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  details?: any;
  timestamp: number;
  retryable: boolean;
  recoverable: boolean;
}

interface ApiErrorDisplayProps {
  error: ApiErrorDetails | NotionError;
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
  // Convertir NotionError en ApiErrorDetails si nécessaire
  const normalizedError = 'message' in error && 'type' in error
    ? mapNotionErrorToApiError(error as NotionError)
    : error as ApiErrorDetails;
  
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
        {getErrorIcon(normalizedError.type)}
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">
            {getErrorTitle(normalizedError.type)}
          </h4>
          <p className="text-xs text-red-700 mt-1">
            {normalizedError.message}
          </p>
        </div>
        <div className="flex gap-2">
          {normalizedError.retryable && onRetry && (
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
          {getErrorIcon(normalizedError.type)}
          <CardTitle className="text-base">
            {getErrorTitle(normalizedError.type)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>{normalizedError.message}</p>
        
        {normalizedError.statusCode && (
          <div className="bg-slate-50 p-2 rounded text-xs text-muted-foreground">
            Code: {normalizedError.statusCode}
          </div>
        )}
        
        {normalizedError.details && (
          <div className="bg-slate-50 p-2 rounded text-xs overflow-auto max-h-24">
            <pre>{JSON.stringify(normalizedError.details, null, 2)}</pre>
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
          {normalizedError.recoverable && onRecover && (
            <Button size="sm" variant="secondary" onClick={onRecover}>
              Réparer
            </Button>
          )}
          {normalizedError.retryable && onRetry && (
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

/**
 * Fonction utilitaire pour convertir une NotionError en ApiErrorDetails
 */
function mapNotionErrorToApiError(error: NotionError): ApiErrorDetails {
  // Mapper le type d'erreur Notion vers le type d'erreur API
  let apiErrorType: ApiErrorType = 'unknown';
  
  switch (error.type) {
    case NotionErrorType.NETWORK:
      apiErrorType = 'connection';
      break;
    case NotionErrorType.AUTH:
      apiErrorType = 'authentication';
      break;
    case NotionErrorType.PERMISSION:
      apiErrorType = 'authorization';
      break;
    case NotionErrorType.VALIDATION:
      apiErrorType = 'validation';
      break;
    case NotionErrorType.NOT_FOUND:
      apiErrorType = 'not_found';
      break;
    case NotionErrorType.RATE_LIMIT:
      apiErrorType = 'rate_limit';
      break;
    case NotionErrorType.SERVER:
      apiErrorType = 'server';
      break;
    case NotionErrorType.TIMEOUT:
      apiErrorType = 'timeout';
      break;
    default:
      apiErrorType = 'unknown';
  }
  
  return {
    type: apiErrorType,
    message: error.message,
    originalError: error.originalError,
    details: error.details,
    timestamp: error.timestamp,
    retryable: error.retryable,
    recoverable: error.recoverable || false
  };
}

export default ApiErrorDisplay;
