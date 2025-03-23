
import React, { useState } from 'react';
import { 
  AlertCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ServerCrash,
  Database,
  FileWarning,
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
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling/types';
import { useRetryQueue } from '@/services/notion/errorHandling';

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
  const normalizeError = (): NotionError => {
    if (typeof error === 'string') {
      return {
        id: 'temp-' + Date.now(),
        timestamp: Date.now(),
        message: error,
        type: NotionErrorType.UNKNOWN
      };
    } else if (error instanceof Error) {
      return {
        id: 'temp-' + Date.now(),
        timestamp: Date.now(),
        message: error.message,
        name: error.name,
        stack: error.stack,
        type: NotionErrorType.UNKNOWN
      };
    } else if (typeof error === 'object' && 'type' in error) {
      // C'est déjà une NotionError
      return error as NotionError;
    }
    
    // Cas par défaut
    return {
      id: 'temp-' + Date.now(),
      timestamp: Date.now(),
      message: String(error),
      type: NotionErrorType.UNKNOWN
    };
  };
  
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
  
  // Traiter les formats d'erreur potentiellement complexes
  const formatErrorDetails = (errorDetails: unknown): React.ReactNode => {
    if (!errorDetails) return null;
    
    if (typeof errorDetails === 'string') {
      try {
        // Essayer de parser si c'est une chaîne JSON
        const parsed = JSON.parse(errorDetails);
        return (
          <pre className="text-xs overflow-auto p-2 bg-gray-50 border rounded max-h-40">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      } catch (e) {
        // Si ce n'est pas un JSON, afficher comme texte
        return <p className="text-xs text-gray-600">{errorDetails}</p>;
      }
    }
    
    // Si c'est déjà un objet, le formatter
    return (
      <pre className="text-xs overflow-auto p-2 bg-gray-50 border rounded max-h-40">
        {JSON.stringify(errorDetails, null, 2)}
      </pre>
    );
  };

  // Gérer les actions personnalisées
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
  
  const formatContext = () => {
    if (!context) return null;
    
    if (typeof context === 'string') {
      return context;
    }
    
    return JSON.stringify(context);
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
        
        {context && (
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
