
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle } from 'lucide-react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { Badge } from '@/components/ui/badge';

const RetryQueueMonitor: React.FC = () => {
  const { stats, processNow } = useRetryQueue();
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Rafraîchir la vue périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(c => c + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Gestionnaire pour forcer le traitement
  const handleProcessNow = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await processNow();
    } catch (error) {
      console.error('Erreur lors du traitement de la file d\'attente:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">File d'attente Notion</CardTitle>
            <CardDescription>
              Opérations en attente de nouvelles tentatives
            </CardDescription>
          </div>
          {stats.totalOperations > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessNow}
              disabled={isProcessing || stats.pendingOperations === 0}
              className="h-8"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Traiter maintenant
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-gray-50">
              {stats.totalOperations} opération{stats.totalOperations !== 1 ? 's' : ''} totale{stats.totalOperations !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-800">
              {stats.pendingOperations} en attente
            </Badge>
          </div>
          
          {stats.totalOperations === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <p>Aucune opération en attente</p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border mt-2">
              <p className="text-sm">
                {stats.isProcessing ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement des opérations en cours...
                  </span>
                ) : stats.pendingOperations > 0 ? (
                  <span>
                    {stats.pendingOperations} opération{stats.pendingOperations !== 1 ? 's' : ''} prête{stats.pendingOperations !== 1 ? 's' : ''} pour une nouvelle tentative
                  </span>
                ) : (
                  <span>
                    Toutes les opérations sont planifiées pour plus tard
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryQueueMonitor;
