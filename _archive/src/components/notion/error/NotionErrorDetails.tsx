
import React, { useState, useCallback } from 'react';
import { 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  ServerCrash,
  FileWarning,
  Database,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { NotionError, NotionErrorType, NotionErrorOptions } from '@/services/notion/types/unified';
import { useRetryQueue } from '@/services/notion/errorHandling';
import { notionErrorService } from '@/services/notion/errorHandling/errorService';

interface NotionErrorDetailsProps {
  error?: string | Error | NotionError;
  context?: string | Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({ 
  error, 
  context, 
  isOpen, 
  onClose,
  onRetry,
  actions = []
}) => {
  const { enqueue } = useRetryQueue();
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  if (!error) return null;
  
  // Normaliser l'erreur en objet NotionError si nécessaire
  const normalizeError = useCallback((): NotionError => {
    if (typeof error === 'string') {
      return notionErrorService.createError(error, {
        context: context as string | Record<string, any>,
        retryable: false,
        recoverable: false
      });
    } else if (error instanceof Error) {
      const options: NotionErrorOptions = {
        context: context as string | Record<string, any>,
        cause: error,
        stack: error.stack,
        retryable: false,
        recoverable: false
      };
      return notionErrorService.createError(error.message, options);
    } else if (typeof error === 'object' && 'type' in error) {
      // C'est déjà une NotionError
      return error as NotionError;
    }
    
    // Cas par défaut
    return notionErrorService.createError(String(error), {
      context: context as string | Record<string, any>,
      retryable: false,
      recoverable: false
    });
  }, [error, context]);
  
  const errorObj = normalizeError();
  const errorMessage = errorObj.message || 'Erreur inconnue';
  
  const getErrorIcon = (type?: NotionErrorType) => {
    switch (type) {
      case NotionErrorType.API:
        return <ServerCrash className="h-5 w-5 text-red-500" />;
      case NotionErrorType.CORS:
        return <FileWarning className="h-5 w-5 text-amber-500" />;
      case NotionErrorType.DATABASE:
        return <Database className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
      onClose();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  // Formater le contexte pour l'affichage
  const formatContext = useCallback((): React.ReactNode => {
    // Prioriser le contexte passé directement en prop
    const contextToFormat = context || errorObj.context;
    
    if (!contextToFormat) return null;
    
    if (typeof contextToFormat === 'string') {
      return contextToFormat;
    }
    
    try {
      return JSON.stringify(contextToFormat, null, 2);
    } catch (e) {
      return '[Contexte non affichable]';
    }
  }, [context, errorObj.context]);
  
  const renderActions = () => {
    if (!actions || actions.length === 0) return null;
    
    return actions.map((actionItem, index) => (
      <Button
        key={index}
        variant={actionItem.variant || 'outline'}
        size="sm"
        onClick={actionItem.onClick}
      >
        {actionItem.label}
      </Button>
    ));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getErrorIcon(errorObj.type)}
            <span>Erreur d'interaction avec Notion</span>
          </DialogTitle>
          <DialogDescription>
            {errorMessage}
          </DialogDescription>
        </DialogHeader>
        
        {formatContext() && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">Contexte: {formatContext()}</p>
          </div>
        )}
        
        <Separator />
        
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto flex items-center text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            {showDetails ? 'Masquer les détails' : 'Afficher les détails techniques'}
          </Button>
          
          {showDetails && (
            <div className="mt-2 text-xs">
              {errorObj.stack && (
                <div className="mt-2">
                  <p className="font-medium mb-1">Stack trace:</p>
                  <pre className="overflow-auto p-2 bg-gray-50 border rounded text-[10px] max-h-40">
                    {errorObj.stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2">
          <div className="flex gap-2">
            {renderActions()}
            
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Réessayer
              </Button>
            )}
          </div>
          
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionErrorDetails;
