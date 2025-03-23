
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, XCircle, Info, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useNotionErrorService } from '@/services/notion/errorHandling';
import { NotionError, NotionErrorSeverity, NotionErrorType } from '@/services/notion/errorHandling';
import NotionErrorDetails from './NotionErrorDetails';
import { Separator } from '@/components/ui/separator';

interface NotionErrorsListProps {
  title?: string;
  maxItems?: number;
  showControls?: boolean;
  onRetryAll?: () => Promise<void> | void;
}

const NotionErrorsList: React.FC<NotionErrorsListProps> = ({
  title = "Erreurs récentes",
  maxItems = 5,
  showControls = true,
  onRetryAll
}) => {
  const { errors, clearErrors } = useNotionErrorService();
  const [selectedError, setSelectedError] = useState<NotionError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Trier les erreurs par date (plus récentes en premier)
  const sortedErrors = [...errors].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return dateB - dateA;
  });
  
  // Limiter le nombre d'erreurs affichées
  const displayedErrors = sortedErrors.slice(0, maxItems);
  
  // Obtenir l'icône en fonction du type d'erreur
  const getErrorIcon = (error: NotionError) => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case NotionErrorType.NETWORK:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case NotionErrorType.RATE_LIMIT:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case NotionErrorType.PERMISSION:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };
  
  // Obtenir la classe CSS en fonction de la sévérité
  const getSeverityClass = (severity: NotionErrorSeverity | null) => {
    switch (severity) {
      case NotionErrorSeverity.ERROR:
        return 'bg-red-50 border-red-200 text-red-700';
      case NotionErrorSeverity.WARNING:
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case NotionErrorSeverity.INFO:
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };
  
  // Gérer le retry de toutes les erreurs
  const handleRetryAll = async () => {
    if (!onRetryAll) return;
    
    setIsRetrying(true);
    try {
      await onRetryAll();
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {errors.length > 0 
                ? `${errors.length} erreur${errors.length > 1 ? 's' : ''} enregistrée${errors.length > 1 ? 's' : ''}`
                : 'Aucune erreur enregistrée'}
            </CardDescription>
          </div>
          
          {showControls && errors.length > 0 && (
            <div className="space-x-2">
              {onRetryAll && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRetryAll}
                  disabled={isRetrying}
                  className="h-8"
                >
                  {isRetrying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Réessayer tout
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearErrors}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {selectedError ? (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedError(null)}
              className="mb-2"
            >
              ← Retour à la liste
            </Button>
            
            <NotionErrorDetails 
              error={selectedError} 
              onClose={() => setSelectedError(null)}
            />
          </div>
        ) : displayedErrors.length > 0 ? (
          <div className="space-y-2">
            {displayedErrors.map((error, index) => (
              <div key={index}>
                <div 
                  className={`p-3 rounded-md border flex items-start cursor-pointer hover:bg-slate-50 transition-colors ${getSeverityClass(error.severity)}`}
                  onClick={() => setSelectedError(error)}
                >
                  <div className="mt-0.5 mr-3 flex-shrink-0">
                    {getErrorIcon(error)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="font-medium text-sm">
                      {error.message}
                    </div>
                    
                    <div className="text-xs mt-1 flex items-center">
                      <span className="font-medium mr-2">
                        {error.type}
                      </span>
                      
                      {error.timestamp && (
                        <span className="text-slate-500">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < displayedErrors.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
            <p>Aucune erreur à afficher</p>
            <p className="text-xs mt-1">Le système fonctionne normalement</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotionErrorsList;
