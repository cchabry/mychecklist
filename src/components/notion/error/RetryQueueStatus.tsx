
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Inbox, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useRetryQueue } from '@/services/notion/errorHandling';

interface RetryQueueStatusProps {
  minimal?: boolean;
  showControls?: boolean;
}

/**
 * Composant pour afficher l'état de la file d'attente de réessais
 */
const RetryQueueStatus: React.FC<RetryQueueStatusProps> = ({
  minimal = false,
  showControls = true
}) => {
  const { 
    pendingCount,
    successCount,
    errorCount,
    isProcessing,
    processQueue,
    clearQueue
  } = useRetryQueue();
  
  const totalOperations = pendingCount + 
    (successCount || 0) + 
    (errorCount || 0);
  
  // Pas de contenu si aucune opération
  if (totalOperations === 0) {
    return null;
  }
  
  // Calculer les pourcentages pour la barre de progression
  const calculatePercentage = (count: number) => Math.round((count / totalOperations) * 100);
  
  const pendingPercent = calculatePercentage(pendingCount);
  const successPercent = calculatePercentage(successCount || 0);
  const failedPercent = calculatePercentage(errorCount || 0);
  
  // Version minimale pour affichage dans un header ou un footer
  if (minimal) {
    return (
      <div className="flex items-center gap-2">
        <Inbox className="h-4 w-4 text-blue-500" />
        <span className="text-sm">
          {pendingCount} opération{pendingCount !== 1 ? 's' : ''} en attente
        </span>
        {showControls && pendingCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2" 
            onClick={() => processQueue()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Exécuter
          </Button>
        )}
      </div>
    );
  }
  
  // Version complète
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">
          État de la file d'attente
        </h4>
        {showControls && (
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => processQueue()}
              disabled={pendingCount === 0}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Exécuter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearQueue()}
              disabled={pendingCount === 0}
            >
              Vider
            </Button>
          </div>
        )}
      </div>
      
      <Progress value={successPercent + pendingPercent} className="h-2" />
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>En attente: {pendingCount}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Réussies: {successCount || 0}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>Échouées: {errorCount || 0}</span>
        </div>
      </div>
      
      {isProcessing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Traitement en cours...</span>
        </div>
      )}
    </div>
  );
};

export default RetryQueueStatus;
