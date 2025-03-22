
import React from 'react';
import { useNotionErrorService } from '@/services/notion/errorHandling';
import NotionErrorDetails from './NotionErrorDetails';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { recentErrors, clearErrors } = useNotionErrorService();
  
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
  
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {recentErrors.length > 0 && (
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
        
        {recentErrors.length > 0 && (
          <CardDescription>
            {recentErrors.length} erreur{recentErrors.length > 1 ? 's' : ''} récente{recentErrors.length > 1 ? 's' : ''}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {recentErrors.length > 0 ? (
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="space-y-3">
              {recentErrors.map((error, index) => (
                <NotionErrorDetails 
                  key={`${error.timestamp.getTime()}-${index}`} 
                  error={error} 
                  showActions={index === 0}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-slate-400">
            {emptyMessage}
          </div>
        )}
      </CardContent>
      
      {recentErrors.length > 3 && (
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
    </Card>
  );
};

export default NotionErrorsList;
