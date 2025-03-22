
import React from 'react';
import { 
  NotionError, 
  NotionErrorSeverity,
  NotionErrorType 
} from '@/services/notion/errorHandling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { operationMode } from '@/services/operationMode';
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Database
} from 'lucide-react';

interface NotionErrorDetailsProps {
  error: NotionError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showActions?: boolean;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({
  error,
  onRetry,
  onDismiss,
  showActions = true
}) => {
  // Obtenir la couleur et l'icône en fonction de la gravité
  const getSeverityInfo = (severity: NotionErrorSeverity) => {
    switch (severity) {
      case NotionErrorSeverity.INFO:
        return { 
          color: 'bg-blue-100 text-blue-800',
          icon: <Info className="h-4 w-4 text-blue-600" />
        };
      
      case NotionErrorSeverity.WARNING:
        return { 
          color: 'bg-amber-100 text-amber-800',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />
        };
        
      case NotionErrorSeverity.ERROR:
        return { 
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4 text-red-600" />
        };
        
      case NotionErrorSeverity.CRITICAL:
        return { 
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4 text-red-600" />
        };
        
      default:
        return { 
          color: 'bg-gray-100 text-gray-800',
          icon: <Info className="h-4 w-4 text-gray-600" />
        };
    }
  };
  
  // Obtenir le type d'erreur formaté
  const getErrorTypeLabel = (type: NotionErrorType) => {
    switch (type) {
      case NotionErrorType.NETWORK: return 'Réseau';
      case NotionErrorType.AUTH: return 'Authentification';
      case NotionErrorType.PERMISSION: return 'Permission';
      case NotionErrorType.RATE_LIMIT: return 'Limite d\'API';
      case NotionErrorType.VALIDATION: return 'Validation';
      case NotionErrorType.DATABASE: return 'Base de données';
      case NotionErrorType.UNKNOWN: return 'Inconnue';
      default: return type;
    }
  };
  
  // Formater la date
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(date);
  };
  
  // Gérer le passage en mode démo
  const handleSwitchToDemo = () => {
    operationMode.enableDemoMode(`Suite à une erreur: ${error.message}`);
  };
  
  const { color, icon } = getSeverityInfo(error.severity);
  
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{getErrorTypeLabel(error.type)}</CardTitle>
          </div>
          <Badge className={color}>
            {error.severity}
          </Badge>
        </div>
        <CardDescription className="text-red-700 font-medium">
          {error.message}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 pb-2 text-sm">
        {error.context && Object.keys(error.context).length > 0 && (
          <div className="mb-3">
            <p className="font-medium mb-1">Contexte:</p>
            <div className="bg-slate-50 p-2 rounded text-xs">
              {Object.entries(error.context).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-medium">{key}:</span>{' '}
                  <span className="text-slate-700">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {error.recoveryActions && error.recoveryActions.length > 0 && (
          <div>
            <p className="font-medium mb-1">Actions suggérées:</p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {error.recoveryActions.map((action, index) => (
                <li key={index} className="text-slate-700">{action}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTimestamp(error.timestamp)}</span>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="h-7 px-2 text-xs">
                <RefreshCw size={12} className="mr-1" />
                Réessayer
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleSwitchToDemo} className="h-7 px-2 text-xs">
              <Database size={12} className="mr-1" />
              Mode démo
            </Button>
            
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 px-2 text-xs">
                Ignorer
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default NotionErrorDetails;
