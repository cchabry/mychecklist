
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Play, RefreshCw, Clock, Ban, ArrowUp, RotateCw } from 'lucide-react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';

const RetryQueueMonitor: React.FC = () => {
  const { 
    stats, 
    queuedOperations, 
    processQueue, 
    clearQueue 
  } = useRetryQueue();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Gérer le traitement de la file d'attente
  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      await processQueue();
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gérer le compte à rebours pour la prochaine tentative
  useEffect(() => {
    if (queuedOperations.length === 0) {
      setCountdown(null);
      return;
    }
    
    // Trouver la prochaine opération à exécuter
    const nextOperation = queuedOperations.reduce((earliest, op) => {
      if (!earliest.nextRetry) return op;
      if (!op.nextRetry) return earliest;
      return op.nextRetry < earliest.nextRetry ? op : earliest;
    });
    
    if (!nextOperation.nextRetry) {
      setCountdown(null);
      return;
    }
    
    // Calculer le temps restant
    const updateCountdown = () => {
      const now = Date.now();
      const nextRetryTime = new Date(nextOperation.nextRetry).getTime();
      const remaining = Math.max(0, Math.floor((nextRetryTime - now) / 1000));
      
      setCountdown(remaining);
      
      // Arrêter le compte à rebours quand il atteint 0
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(null);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [queuedOperations]);
  
  // Formater le temps restant
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">File d'attente des opérations</CardTitle>
            <CardDescription>
              {stats.pendingOperations} opération{stats.pendingOperations !== 1 ? 's' : ''} en attente
            </CardDescription>
          </div>
          
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessQueue}
              disabled={isProcessing || stats.pendingOperations === 0}
            >
              {isProcessing ? (
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Exécuter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearQueue}
              disabled={stats.pendingOperations === 0}
            >
              <Ban className="h-4 w-4 mr-2" />
              Vider
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Stats de la file d'attente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500 mb-1">En attente</div>
            <div className="text-2xl font-bold">{stats.pendingOperations}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500 mb-1">Réussies</div>
            <div className="text-2xl font-bold text-green-600">{stats.successful || 0}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500 mb-1">Échouées</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
          </div>
        </div>
        
        {/* Prochaine tentative */}
        {countdown !== null && countdown > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Prochaine tentative</span>
              <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                {formatCountdown(countdown)}
              </span>
            </div>
            <Progress value={0} className="h-1" />
          </div>
        )}
        
        {/* Liste des opérations */}
        {queuedOperations.length > 0 ? (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium">Opérations en file d'attente</h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {queuedOperations.map((op) => (
                <div 
                  key={op.id} 
                  className="text-xs p-3 bg-slate-50 rounded border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{op.context}</div>
                      <div className="text-slate-500 mt-1">
                        Tentative {op.attempts}/{op.maxAttempts}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {op.status === 'pending' ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm border border-amber-200 text-[10px]">
                          En attente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-sm border border-green-200 text-[10px]">
                          Succès
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {op.nextRetry && (
                    <div className="mt-2 flex items-center text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        Prochain essai: {new Date(op.nextRetry).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <ArrowUp className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">La file d'attente est vide</p>
            <p className="text-xs">Utilisez le bouton ci-dessus pour traiter les opérations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RetryQueueMonitor;
