
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NotionError } from '@/services/notion/types/unified';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import useRetryQueue from '@/hooks/notion/useRetryQueue';

interface NotionErrorDetailsProps {
  error: NotionError;
  context?: string | Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => Promise<void>;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({
  error,
  context,
  isOpen,
  onClose,
  onRetry,
}) => {
  const { addOperation } = useRetryQueue();
  const [activeTab, setActiveTab] = React.useState('details');
  const [isRetrying, setIsRetrying] = React.useState(false);

  // Créer une requête de nouvelle tentative avec l'opération fournie
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la nouvelle tentative:', error);
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Mettre l'opération dans la file d'attente
  const handleAddToQueue = () => {
    if (!onRetry) return;
    
    addOperation(
      onRetry, 
      error.context?.toString() || 'Opération depuis les détails d\'erreur'
    );
    
    onClose();
  };

  // Formatter l'objet de contexte pour l'affichage
  const formatContext = (ctx: any): React.ReactNode => {
    if (!ctx) return <span className="text-muted-foreground">Aucun contexte</span>;
    
    // Si c'est une chaîne de caractères
    if (typeof ctx === 'string') {
      return <span>{ctx}</span>;
    }
    
    // Si c'est un objet
    try {
      return (
        <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto text-xs">
          {JSON.stringify(ctx, null, 2)}
        </pre>
      );
    } catch (e) {
      return <span className="text-muted-foreground">Contexte non affichable</span>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Détails de l'erreur Notion</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="details">Informations</TabsTrigger>
            <TabsTrigger value="stack">Stack Trace</TabsTrigger>
            <TabsTrigger value="context">Contexte</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="details" className="space-y-4 min-h-[300px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Message</h3>
                  <p className="text-sm">{error.message}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Type</h3>
                  <p className="text-sm">{error.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Sévérité</h3>
                  <p className="text-sm">{error.severity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">ID</h3>
                  <p className="text-sm font-mono">{error.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Timestamp</h3>
                  <p className="text-sm">{new Date(error.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Réessai possible</h3>
                  <p className="text-sm">{error.retryable ? 'Oui' : 'Non'}</p>
                </div>
                {error.operation && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold mb-1">Opération</h3>
                    <p className="text-sm">{error.operation}</p>
                  </div>
                )}
                {error.details && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold mb-1">Détails supplémentaires</h3>
                    <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto text-xs">
                      {typeof error.details === 'string' 
                        ? error.details 
                        : JSON.stringify(error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="stack" className="min-h-[300px]">
              {error.stack ? (
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                  {error.stack}
                </pre>
              ) : (
                <p className="text-muted-foreground">
                  Aucune stack trace disponible pour cette erreur.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="context" className="min-h-[300px]">
              <div>
                <h3 className="text-sm font-semibold mb-2">Contexte de l'erreur</h3>
                {formatContext(error.context)}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {onRetry && (
            <>
              <Button
                variant="outline"
                onClick={handleAddToQueue}
                disabled={isRetrying}
              >
                Ajouter à la file d'attente
              </Button>
              <Button
                onClick={handleRetry}
                disabled={isRetrying || !error.retryable}
              >
                {isRetrying ? 'Nouvelle tentative...' : 'Réessayer maintenant'}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionErrorDetails;
