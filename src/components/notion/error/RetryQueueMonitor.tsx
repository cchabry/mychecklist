
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Pause, Play } from 'lucide-react';
import { QueuedOperation, RetryQueueStats } from '@/services/notion/types/unified';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';

interface RetryQueueMonitorProps {
  title?: string;
  showControls?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  limit?: number;
}

const RetryQueueMonitor: React.FC<RetryQueueMonitorProps> = ({
  title = "File d'attente d'opérations",
  showControls = true,
  showDetails = true,
  compact = false,
  limit = 5
}) => {
  const { stats, queuedOperations, processQueue, clearQueue, pauseQueue, resumeQueue, isPaused } = useRetryQueue();
  const [processing, setProcessing] = useState(false);
  
  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      await processQueue();
    } finally {
      setProcessing(false);
    }
  };
  
  // Si la file est vide et en mode compact, ne rien afficher
  if (compact && stats.pendingOperations === 0) {
    return null;
  }
  
  // Affichage d'un badge de statut
  const StatusBadge = () => {
    if (stats.isProcessing) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          En cours
        </Badge>
      );
    }
    
    if (stats.pendingOperations > 0) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    }
    
    if (stats.completedOperations > 0 && stats.failedOperations === 0) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Terminé
        </Badge>
      );
    }
    
    if (stats.failedOperations > 0) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Échecs
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
        Inactif
      </Badge>
    );
  };
  
  // Formatage du contexte de l'opération
  const formatContext = (context: string | Record<string, any>): React.ReactNode => {
    if (!context) return null;
    
    if (typeof context === 'string') {
      return <span className="text-xs text-muted-foreground">{context}</span>;
    }
    
    try {
      // Convertir l'objet en chaîne JSON pour l'affichage
      return <span className="text-xs text-muted-foreground">{JSON.stringify(context)}</span>;
    } catch (e) {
      return <span className="text-xs text-muted-foreground">[Contexte complexe]</span>;
    }
  };
  
  // Mode compact pour intégration dans d'autres interfaces
  if (compact) {
    return (
      <div className="bg-gray-50 p-3 rounded border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Opérations en attente</h3>
          <StatusBadge />
        </div>
        
        <div className="text-sm">
          <span className="font-medium">{stats.pendingOperations}</span> opération(s) en attente
          {stats.failedOperations > 0 && (
            <span className="ml-2 text-red-600">
              ({stats.failedOperations} échec{stats.failedOperations > 1 ? 's' : ''})
            </span>
          )}
        </div>
        
        {showControls && stats.pendingOperations > 0 && (
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleProcessQueue} 
              disabled={processing}
              className="h-7 text-xs"
            >
              {processing ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
              Traiter
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <StatusBadge />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-medium">{stats.pendingOperations}</div>
              <div className="text-xs text-muted-foreground">En attente</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-medium">{stats.completedOperations}</div>
              <div className="text-xs text-muted-foreground">Terminées</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-medium">{stats.failedOperations}</div>
              <div className="text-xs text-muted-foreground">Échouées</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-medium">{stats.totalOperations}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          
          {/* Contrôles */}
          {showControls && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleProcessQueue} 
                disabled={processing || stats.pendingOperations === 0}
              >
                {processing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Traiter la file
              </Button>
              
              {typeof isPaused === 'function' && typeof pauseQueue === 'function' && typeof resumeQueue === 'function' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={isPaused() ? resumeQueue : pauseQueue}
                >
                  {isPaused() ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused() ? 'Reprendre' : 'Mettre en pause'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearQueue} 
                disabled={stats.pendingOperations === 0}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Vider la file
              </Button>
            </div>
          )}
          
          {/* Liste des opérations */}
          {showDetails && queuedOperations.length > 0 && (
            <div className="space-y-2 mt-2">
              <h4 className="text-sm font-medium">Opérations en file d'attente</h4>
              <div className="space-y-2 max-h-60 overflow-auto">
                {queuedOperations.slice(0, limit).map((op) => (
                  <div key={op.id} className="text-sm border rounded p-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate max-w-[240px]">
                        {formatContext(op.context)}
                      </span>
                      <Badge variant={
                        op.status === 'completed' ? 'outline' : 
                        op.status === 'failed' ? 'destructive' : 
                        op.status === 'processing' ? 'secondary' : 
                        'outline'
                      }>
                        {op.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Tentatives: {op.attempts}/{op.maxAttempts}
                      {op.nextRetry && (
                        <span className="ml-2">
                          Prochain essai: {new Date(op.nextRetry instanceof Date ? op.nextRetry : op.nextRetry).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    
                    {op.error && (
                      <div className="text-xs text-red-600 mt-1 truncate">
                        {op.error.message}
                      </div>
                    )}
                  </div>
                ))}
                
                {queuedOperations.length > limit && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{queuedOperations.length - limit} opération(s) supplémentaire(s)
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Dernière activité */}
          {stats.lastProcessedAt && (
            <div className="text-xs text-muted-foreground">
              Dernière activité: {new Date(stats.lastProcessedAt).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryQueueMonitor;
