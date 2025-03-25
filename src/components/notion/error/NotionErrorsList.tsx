
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { 
  useNotionErrorService,
  useRetryQueue
} from '@/services/notion/errorHandling';
import { NotionError } from '@/services/notion/types/unified';

interface NotionErrorsListProps {
  title?: string;
  maxErrors?: number;
  onRetryAll?: () => void;
  showClearButton?: boolean;
}

const NotionErrorsList: React.FC<NotionErrorsListProps> = ({
  title = 'Erreurs récentes',
  maxErrors = 5,
  onRetryAll,
  showClearButton = true
}) => {
  const { errors, clearErrors } = useNotionErrorService();
  const { processQueue } = useRetryQueue();
  
  // Aucune erreur à afficher
  if (errors.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-muted-foreground text-sm">
            Aucune erreur à afficher
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Limiter le nombre d'erreurs affichées
  const displayedErrors = errors.slice(0, maxErrors);
  
  // Formater l'horodatage
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Gérer le réessai de toutes les opérations
  const handleRetryAll = () => {
    if (onRetryAll) {
      onRetryAll();
    } else {
      processQueue();
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-2">
          {showClearButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearErrors}
              title="Effacer toutes les erreurs"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
          {onRetryAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryAll}
              title="Réessayer toutes les opérations en échec"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayedErrors.map((error) => (
            <ErrorItem key={error.id} error={error} />
          ))}
          
          {errors.length > maxErrors && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              + {errors.length - maxErrors} autres erreurs...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ErrorItemProps {
  error: NotionError;
}

// Sous-composant pour afficher une erreur individuelle
const ErrorItem: React.FC<ErrorItemProps> = ({ error }) => {
  return (
    <div className="p-2 border border-red-100 bg-red-50 rounded-md">
      <div className="flex gap-2">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 break-words">{error.message}</p>
          
          <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-red-600">
            <span>Type: {error.type}</span>
            <span>Heure: {formatTimestamp(error.timestamp)}</span>
            {error.operation && <span>Opération: {error.operation}</span>}
          </div>
          
          {error.context && (
            <div className="mt-1 text-xs text-muted-foreground">
              {typeof error.context === 'string' 
                ? error.context 
                : JSON.stringify(error.context)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionErrorsList;
