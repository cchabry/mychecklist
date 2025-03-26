
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, PauseCircle, XCircle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useRetryQueue from '@/hooks/notion/useRetryQueue';

interface RetryQueueStatusProps {
  className?: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

const RetryQueueStatus: React.FC<RetryQueueStatusProps> = ({
  className,
  showDetails = false,
  onRetry
}) => {
  const { 
    stats, 
    isProcessing, 
    isPaused,
    processNow,
    pauseQueue,
    resumeQueue,
    clearQueue
  } = useRetryQueue();
  
  // S'il n'y a aucune opération, ne rien afficher
  if (stats.total === 0) {
    return showDetails ? (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>File d'attente des réessais</span>
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Vide
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground pb-3">
          Aucune opération en attente.
        </CardContent>
      </Card>
    ) : null;
  }
  
  // Calculer le taux de réussite en pourcentage
  const successRatePercent = stats.total > 0 
    ? Math.round((stats.success / stats.total) * 100) 
    : 0;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>File d'attente des réessais</span>
          {stats.pending > 0 && (
            <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
              {stats.pending} en attente
            </Badge>
          )}
          {stats.pending === 0 && stats.failed > 0 && (
            <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
              {stats.failed} échec{stats.failed > 1 ? 's' : ''}
            </Badge>
          )}
          {stats.pending === 0 && stats.failed === 0 && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Complété
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-amber-500" />
              <span>{stats.pending} en attente</span>
            </div>
            <div className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 text-blue-500" />
              <span>{stats.processing} en cours</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              <span>{stats.success} réussis</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-3 w-3 mr-1 text-red-500" />
              <span>{stats.failed} échoués</span>
            </div>
          </div>
          <div>
            <Badge variant="outline">
              {successRatePercent}% de réussite
            </Badge>
          </div>
        </div>
        
        {showDetails && (
          <Progress 
            value={successRatePercent} 
            className="h-2" 
          />
        )}
        
        {showDetails && (stats.pending > 0 || stats.processing > 0) && (
          <div className="flex justify-end space-x-2 mt-2">
            {isProcessing ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => pauseQueue()}
              >
                <PauseCircle className="h-3.5 w-3.5 mr-1" />
                Pause
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => resumeQueue()}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                Reprendre
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => processNow()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Traiter maintenant
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => clearQueue()}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Vider
            </Button>
            
            {onRetry && (
              <Button
                variant="default"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={onRetry}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Réessayer tout
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RetryQueueStatus;
