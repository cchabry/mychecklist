
import React from 'react';
import { NotionError, NotionErrorType, NotionErrorSeverity } from '@/services/notion/errorHandling';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, FileText, RefreshCw, X } from 'lucide-react';

interface NotionErrorDetailsProps {
  error: NotionError;
  onClose?: () => void;
  onRetry?: () => void;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({
  error,
  onClose,
  onRetry
}) => {
  // Formatter la date
  const formattedDate = error.timestamp 
    ? new Date(error.timestamp).toLocaleString() 
    : 'Date inconnue';
  
  // Déterminer la couleur selon la sévérité
  const getSeverityColor = () => {
    switch (error.severity) {
      case NotionErrorSeverity.ERROR:
        return 'text-red-600';
      case NotionErrorSeverity.WARNING:
        return 'text-amber-600';
      case NotionErrorSeverity.INFO:
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };
  
  // Obtenir le libellé du type d'erreur
  const getErrorTypeLabel = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return 'Authentification';
      case NotionErrorType.NETWORK:
        return 'Réseau';
      case NotionErrorType.RATE_LIMIT:
        return 'Limite d\'API';
      case NotionErrorType.PERMISSION:
        return 'Permission';
      case NotionErrorType.DATABASE:
        return 'Base de données';
      case NotionErrorType.VALIDATION:
        return 'Validation';
      case NotionErrorType.SERVER:
        return 'Serveur';
      default:
        return 'Inconnue';
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <AlertTriangle className={`mr-2 h-5 w-5 ${getSeverityColor()}`} />
            <CardTitle className="text-lg">{error.message}</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Type d'erreur</div>
            <div className="text-sm">{getErrorTypeLabel()}</div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Récupérable</div>
            <div className="text-sm">
              {error.recoverable ? 'Oui' : 'Non'}
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Date</div>
            <div className="text-sm flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formattedDate}
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Contexte</div>
            <div className="text-sm">
              {error.context && typeof error.context === 'object' 
                ? Object.keys(error.context).length > 0 
                  ? 'Voir détails'
                  : 'Aucun contexte'
                : error.context || 'Aucun contexte'}
            </div>
          </div>
        </div>
        
        {error.stack && (
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500 mb-1">Trace d'erreur</div>
            <div className="text-xs font-mono bg-slate-50 p-2 rounded border overflow-x-auto max-h-32 overflow-y-auto">
              {error.stack}
            </div>
          </div>
        )}
        
        {error.context && typeof error.context === 'object' && Object.keys(error.context).length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500 mb-1">Détails du contexte</div>
            <div className="text-xs font-mono bg-slate-50 p-2 rounded border overflow-x-auto max-h-32 overflow-y-auto">
              {JSON.stringify(error.context, null, 2)}
            </div>
          </div>
        )}
      </CardContent>
      
      {(onRetry || error.recoveryActions?.length > 0) && (
        <CardFooter className="border-t pt-4 flex justify-between">
          {error.recoveryActions?.length > 0 ? (
            <div className="space-x-2">
              {error.recoveryActions.map((action, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  onClick={action.action}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <div></div>
          )}
          
          {onRetry && error.recoverable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default NotionErrorDetails;
