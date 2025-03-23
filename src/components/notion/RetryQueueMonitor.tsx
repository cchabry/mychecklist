
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Play, X, CheckCircle2 } from 'lucide-react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const RetryQueueMonitor: React.FC = () => {
  const { 
    stats, 
    queuedOperations, 
    processQueue, 
    clearQueue 
  } = useRetryQueue();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Traiter la file d'attente
  const handleProcessQueue = async () => {
    setIsProcessing(true);
    await processQueue();
    setIsProcessing(false);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">File d'attente des opérations</CardTitle>
            <CardDescription>
              Gestion des opérations Notion en attente de retry
            </CardDescription>
          </div>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleProcessQueue}
              disabled={isProcessing || stats.pendingOperations === 0}
              className="h-8"
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
              className="h-8"
            >
              <X className="h-4 w-4 mr-2" />
              Vider
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm font-medium text-slate-500">En attente</div>
            <div className="text-2xl font-bold">{stats.pendingOperations}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm font-medium text-slate-500">Réussies</div>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm font-medium text-slate-500">Échouées</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
        </div>
        
        {stats.pendingOperations > 0 && (
          <div className="space-y-1 mt-2">
            <div className="text-sm font-medium">Taux de succès</div>
            <Progress value={stats.successRate} className="h-2" />
            <div className="text-xs text-right text-slate-500">
              {stats.successRate}%
            </div>
          </div>
        )}
        
        {queuedOperations.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Opérations en attente</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {queuedOperations.map((op) => (
                <div 
                  key={op.id} 
                  className="text-xs p-2 bg-slate-50 rounded border flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{op.context}</div>
                    <div className="text-slate-500 mt-0.5">
                      Tentative {op.attempts}/{op.maxAttempts}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {op.status === 'pending' ? (
                      <span className="px-1.5 py-0.5 text-amber-700 bg-amber-50 rounded-sm border border-amber-200 text-[10px]">
                        En attente
                      </span>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-sm">
            Aucune opération en attente
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RetryQueueMonitor;
