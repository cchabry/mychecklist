
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw, ChevronRight, KeyRound, ServerCrash, Database } from 'lucide-react';
import { useNotionErrorService, NotionError, NotionErrorType, NotionErrorSeverity } from '@/services/notion/errorHandling';

interface NotionErrorsListProps {
  maxItems?: number;
  onRetryAll?: () => void;
  onShowDetails?: (error: NotionError) => void;
  compact?: boolean;
}

const NotionErrorsList: React.FC<NotionErrorsListProps> = ({
  maxItems = 5,
  onRetryAll,
  onShowDetails,
  compact = false
}) => {
  const { errors, clearErrors } = useNotionErrorService();
  
  if (errors.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Aucune erreur récente
      </div>
    );
  }
  
  const getErrorIcon = (error: NotionError) => {
    switch(error.type) {
      case NotionErrorType.AUTH:
        return <KeyRound className="h-4 w-4 text-amber-500" />;
        
      case NotionErrorType.API:
      case NotionErrorType.RATE_LIMIT:
        return <ServerCrash className="h-4 w-4 text-red-500" />;
        
      case NotionErrorType.DATABASE:
      case NotionErrorType.PERMISSION:
        return <Database className="h-4 w-4 text-amber-500" />;
        
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const errorItems = errors.slice(0, maxItems).map((error) => (
    <div 
      key={error.id} 
      className="p-3 border rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="mt-1">
          {getErrorIcon(error)}
        </div>
        
        <div className="flex-grow">
          <div className="font-medium text-sm">{error.message}</div>
          {error.context && (
            <p className="text-xs text-muted-foreground mt-1">
              {error.context}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(error.timestamp).toLocaleString()}
          </p>
        </div>
        
        {onShowDetails && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onShowDetails(error)}
            className="p-1 h-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  ));
  
  if (compact) {
    return (
      <div className="space-y-2">
        {errorItems}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {errorItems}
      </div>
      
      {errors.length > 0 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearErrors}
          >
            Effacer toutes les erreurs
          </Button>
          
          {onRetryAll && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetryAll}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer toutes
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotionErrorsList;
