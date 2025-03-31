import React, { useState } from 'react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, PlayCircle, PauseCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QueuedOperation } from '@/services/notion/types/unified';

interface RetryQueueMonitorProps {
  title?: string;
  showOperationList?: boolean;
  compact?: boolean;
}

const RetryQueueMonitor: React.FC<RetryQueueMonitorProps> = ({
  title = "File d'attente des opérations",
  showOperationList = true,
  compact = false
}) => {
  const { 
    stats, 
    queuedOperations, 
    processQueue, 
    clearQueue, 
    pauseQueue, 
    resumeQueue, 
    isPaused,
    processNow
  } = useRetryQueue();
  
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  
  const handleProcessNow = async (operationId: string) => {
    try {
      setSelectedOperation(operationId);
      await processNow(operationId);
      setSelectedOperation(null);
    } catch (e) {
      console.error('Erreur lors du traitement immédiat:', e);
      setSelectedOperation(null);
    }
  };
  
  // Calculer les pourcentages pour la barre de progression
  const calculatePercentage = (count: number) => {
    const total = stats.totalOperations > 0 ? stats.totalOperations : 1;
    return Math.round((count / total) * 100);
  };
  
  const pendingPercent = calculatePercentage(stats.pendingOperations);
  const successPercent = calculatePercentage(stats.completedOperations);
  const failedPercent = calculatePercentage(stats.failedOperations);
  const isPausedState = isPaused ? isPaused() : false;
  
  if (compact) {
    return (
      <div className="border rounded-md p-2 text-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          
          {stats.pendingOperations > 0 && (
            <Button variant="ghost" size="sm" onClick={() => processQueue()}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Exécuter
            </Button>
          )}
        </div>
        
        <Progress className="h-1 mt-2" value={successPercent + pendingPercent} />
        
        <div className="mt-1 text-xs text-muted-foreground">
          {stats.pendingOperations} en attente, {stats.completedOperations} terminées
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isPausedState ? resumeQueue() : pauseQueue()}
              disabled={stats.pendingOperations === 0}
            >
              {isPausedState ? (
                <PlayCircle className="h-4 w-4 mr-1" />
              ) : (
                <PauseCircle className="h-4 w-4 mr-1" />
              )}
              {isPausedState ? 'Reprendre' : 'Pause'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => processQueue()}
              disabled={stats.pendingOperations === 0 || stats.isProcessing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${stats.isProcessing ? 'animate-spin' : ''}`} />
              Exécuter
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearQueue()}
              disabled={stats.pendingOperations === 0}
            >
              Vider
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="border rounded-md p-3 text-center">
                <p className="text-2xl font-semibold">{stats.pendingOperations}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
              
              <div className="border rounded-md p-3 text-center">
                <p className="text-2xl font-semibold text-green-600">{stats.completedOperations}</p>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </div>
              
              <div className="border rounded-md p-3 text-center">
                <p className="text-2xl font-semibold text-red-600">{stats.failedOperations}</p>
                <p className="text-xs text-muted-foreground">Échouées</p>
              </div>
            </div>
            
            <Progress value={successPercent + pendingPercent} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Succès: {successPercent}%</span>
              <span>En attente: {pendingPercent}%</span>
              <span>Échecs: {failedPercent}%</span>
            </div>
          </div>
          
          {showOperationList && queuedOperations && queuedOperations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Opérations en file d'attente</h4>
              
              <div className="border rounded-md divide-y">
                {queuedOperations.map((op: QueuedOperation) => (
                  <div key={op.id} className="p-2 text-sm hover:bg-muted/40">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {op.status === 'pending' && <Clock className="h-3 w-3 text-blue-500 mr-2" />}
                        {op.status === 'processing' && <RefreshCw className="h-3 w-3 text-amber-500 animate-spin mr-2" />}
                        {op.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500 mr-2" />}
                        {op.status === 'failed' && <XCircle className="h-3 w-3 text-red-500 mr-2" />}
                        
                        <span className="truncate max-w-[200px]">
                          {typeof op.context === 'string' ? op.context : JSON.stringify(op.context)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          op.status === 'pending' ? 'outline' :
                          op.status === 'processing' ? 'secondary' :
                          op.status === 'completed' ? 'success' :
                          'destructive'
                        }>
                          {op.status}
                        </Badge>
                        
                        {op.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleProcessNow(op.id)}
                            disabled={selectedOperation === op.id}
                          >
                            {selectedOperation === op.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              'Exécuter'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {op.error && (
                      <div className="mt-1 text-xs text-red-500 truncate">
                        {op.error.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {stats.isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Traitement en cours...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryQueueMonitor;
