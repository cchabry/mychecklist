
import React, { useState } from 'react';
import { useNotionErrorService } from '@/hooks/notion/useNotionErrorService';
import { NotionError } from '@/services/notion/errorHandling/types';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotionErrorDetails from './NotionErrorDetails';

interface NotionErrorsListProps {
  title?: string;
  maxHeight?: string;
  onRetryAll?: () => void;
  showClearButton?: boolean;
  emptyMessage?: string;
}

const NotionErrorsList: React.FC<NotionErrorsListProps> = ({
  title = "Erreurs récentes",
  maxHeight = "400px",
  onRetryAll,
  showClearButton = true,
  emptyMessage = "Aucune erreur récente"
}) => {
  const { errors, clearErrors } = useNotionErrorService();
  const [selectedError, setSelectedError] = useState<NotionError | null>(null);
  
  // Gérer le clic sur réessayer
  const handleRetry = () => {
    if (onRetryAll) {
      onRetryAll();
    }
  };
  
  // Gérer le clic sur effacer
  const handleClear = () => {
    clearErrors();
  };

  // Afficher les détails d'une erreur
  const handleShowDetails = (error: NotionError) => {
    setSelectedError(error);
  };

  // Fermer les détails
  const handleCloseDetails = () => {
    setSelectedError(null);
  };
  
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {errors.length > 0 && (
            <div className="flex gap-2">
              {onRetryAll && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="h-8"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Réessayer tout
                </Button>
              )}
              
              {showClearButton && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClear}
                  className="h-8"
                >
                  <Trash2 size={14} className="mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          )}
        </div>
        
        {errors.length > 0 && (
          <CardDescription>
            {errors.length} erreur{errors.length > 1 ? 's' : ''} récente{errors.length > 1 ? 's' : ''}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {errors.length > 0 ? (
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div 
                  key={`${error.timestamp.getTime()}-${index}`}
                  className="p-3 border rounded-md hover:border-slate-300 cursor-pointer"
                  onClick={() => handleShowDetails(error)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{error.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {error.context ? JSON.stringify(error.context) : 'Aucun contexte'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-slate-400">
            {emptyMessage}
          </div>
        )}
      </CardContent>
      
      {errors.length > 3 && (
        <CardFooter className="flex justify-end pt-2">
          {showClearButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
            >
              Effacer l'historique
            </Button>
          )}
        </CardFooter>
      )}

      {selectedError && (
        <NotionErrorDetails
          isOpen={!!selectedError}
          onClose={handleCloseDetails}
          error={selectedError.message}
          context={selectedError.context ? JSON.stringify(selectedError.context) : undefined}
        />
      )}
    </Card>
  );
};

export default NotionErrorsList;
