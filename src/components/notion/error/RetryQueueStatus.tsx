
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRetryQueue } from '@/services/notion/errorHandling';
import { Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RetryQueueStatusProps {
  showDetails?: boolean;
  showControls?: boolean;
  className?: string;
}

const RetryQueueStatus: React.FC<RetryQueueStatusProps> = ({
  showDetails = false,
  showControls = true,
  className = ''
}) => {
  const { stats, isProcessing, processQueue, clearQueue } = useRetryQueue();
  
  // Déterminer le statut global
  const hasPending = stats.pending > 0;
  const hasProcessing = stats.processing > 0;
  
  // Déterminer le style de la badge
  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let badgeText = 'File inactive';
  let badgeIcon = <Activity className="h-3 w-3 mr-1" />;
  
  if (isProcessing || hasProcessing) {
    badgeVariant = 'default';
    badgeText = 'Traitement en cours';
    badgeIcon = <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
  } else if (hasPending) {
    badgeVariant = 'secondary';
    badgeText = `${stats.pending} en attente`;
    badgeIcon = <Activity className="h-3 w-3 mr-1" />;
  } else if (stats.failed > 0) {
    badgeVariant = 'destructive';
    badgeText = `${stats.failed} échec${stats.failed > 1 ? 's' : ''}`;
    badgeIcon = <XCircle className="h-3 w-3 mr-1" />;
  } else if (stats.success > 0) {
    badgeVariant = 'outline';
    badgeText = `${stats.success} réussie${stats.success > 1 ? 's' : ''}`;
    badgeIcon = <CheckCircle2 className="h-3 w-3 mr-1" />;
  }
  
  // Si pas de détails et pas d'opérations, ne rien afficher
  if (!showDetails && stats.total === 0) {
    return null;
  }
  
  // Version simple avec juste la badge
  if (!showDetails) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge variant={badgeVariant} className={`cursor-pointer ${className}`}>
            {badgeIcon} {badgeText}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Opérations en file d'attente</h4>
            <p className="text-xs text-muted-foreground">
              {stats.total === 0 
                ? 'Aucune opération en file d\'attente' 
                : `${stats.total} opération${stats.total > 1 ? 's' : ''} au total`}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary/20 p-2 rounded">
                <span className="font-medium">En attente:</span> {stats.pending}
              </div>
              <div className="bg-primary/20 p-2 rounded">
                <span className="font-medium">En cours:</span> {stats.processing}
              </div>
              <div className="bg-green-100 p-2 rounded">
                <span className="font-medium">Réussies:</span> {stats.success}
              </div>
              <div className="bg-red-100 p-2 rounded">
                <span className="font-medium">Échouées:</span> {stats.failed}
              </div>
            </div>
            
            {showControls && stats.total > 0 && (
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={clearQueue} 
                  disabled={isProcessing}
                >
                  Effacer la file
                </Button>
                <Button 
                  size="sm" 
                  onClick={processQueue} 
                  disabled={isProcessing || stats.pending === 0}
                >
                  {isProcessing ? 'Traitement...' : 'Traiter'}
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  
  // Version détaillée
  return (
    <div className={`border rounded-md p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">File de réessais Notion</h3>
        <Badge variant={badgeVariant}>
          {badgeIcon} {badgeText}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-secondary/20 p-3 rounded">
          <div className="text-sm font-medium">En attente</div>
          <div className="text-2xl">{stats.pending}</div>
        </div>
        <div className="bg-primary/20 p-3 rounded">
          <div className="text-sm font-medium">En cours</div>
          <div className="text-2xl">{stats.processing}</div>
        </div>
        <div className="bg-green-100 p-3 rounded">
          <div className="text-sm font-medium">Réussies</div>
          <div className="text-2xl">{stats.success}</div>
        </div>
        <div className="bg-red-100 p-3 rounded">
          <div className="text-sm font-medium">Échouées</div>
          <div className="text-2xl">{stats.failed}</div>
        </div>
      </div>
      
      {stats.lastError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="text-sm font-medium text-red-800">Dernière erreur</div>
          <div className="text-xs text-red-700 mt-1">{stats.lastError.message}</div>
        </div>
      )}
      
      {showControls && (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={clearQueue} 
            disabled={isProcessing || stats.total === 0}
          >
            Effacer la file
          </Button>
          <Button 
            onClick={processQueue} 
            disabled={isProcessing || stats.pending === 0}
          >
            {isProcessing ? 'Traitement en cours...' : 'Traiter la file'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RetryQueueStatus;
