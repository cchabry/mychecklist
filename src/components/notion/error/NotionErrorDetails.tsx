
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Database, Router, ShieldAlert, X } from 'lucide-react';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling';
import { Badge } from '@/components/ui/badge';
import { useOperationMode } from '@/services/operationMode';

interface NotionErrorDetailsProps {
  error: NotionError | string;
  context?: string | Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({
  error,
  context,
  isOpen,
  onClose
}) => {
  const operationMode = useOperationMode();
  
  // Formatter l'erreur si c'est une chaîne
  const formattedError = typeof error === 'string'
    ? { message: error, type: NotionErrorType.UNKNOWN } as NotionError
    : error;
  
  // Déterminer l'icône en fonction du type d'erreur
  const ErrorIcon = () => {
    switch (formattedError.type) {
      case NotionErrorType.NETWORK:
        return <Router className="h-5 w-5 text-red-500" />;
      case NotionErrorType.AUTH:
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case NotionErrorType.PERMISSION:
        return <X className="h-5 w-5 text-red-400" />;
      case NotionErrorType.RATE_LIMIT:
        return <Clock className="h-5 w-5 text-blue-500" />;
      case NotionErrorType.DATABASE:
        return <Database className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };
  
  // Activer le mode démo si demandé
  const handleEnableDemoMode = () => {
    operationMode.enableDemoMode('Suite à une erreur Notion');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ErrorIcon />
            Détails de l'erreur Notion
          </DialogTitle>
          <DialogDescription>
            Informations sur l'erreur et possibles solutions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Message d'erreur</h3>
            <p className="text-sm p-3 bg-gray-100 rounded-md">
              {formattedError.message}
            </p>
          </div>
          
          {formattedError.type && (
            <div className="flex gap-2 items-center">
              <h3 className="text-sm font-medium">Type:</h3>
              <Badge variant="outline" className="bg-gray-100">
                {formattedError.type}
              </Badge>
            </div>
          )}
          
          {context && (
            <div>
              <h3 className="text-sm font-medium mb-1">Contexte</h3>
              <p className="text-sm text-muted-foreground">
                {typeof context === 'string' 
                  ? context 
                  : JSON.stringify(context, null, 2)}
              </p>
            </div>
          )}
          
          {formattedError.recoveryActions && formattedError.recoveryActions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1">Actions recommandées</h3>
              <ul className="text-sm space-y-1">
                {formattedError.recoveryActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          
          <Button 
            type="button"
            variant="secondary"
            onClick={handleEnableDemoMode}
          >
            Passer en mode démo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionErrorDetails;
