
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Clock, Play, RefreshCw, Trash2 } from 'lucide-react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { Progress } from '@/components/ui/progress';

const RetryQueueMonitor: React.FC = () => {
  const { 
    queuedOperations,
    stats,
    processQueue,
    clearQueue,
  } = useRetryQueue();
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Rafraîchir les informations de la file d'attente
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Configurer un intervalle de rafraîchissement
    const interval = setInterval(handleRefresh, 3000);
    return () => clearInterval(interval);
  }, []);

  // Formater le temps relatif (ex: "il y a 2min")
  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `il y a ${seconds}s`;
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
    return `il y a ${Math.floor(seconds / 86400)}j`;
  };

  // Statut de l'opération sous forme de badge
  const getStatusBadge = (operation: any) => {
    if (operation.status === 'pending') {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
    }
    if (operation.status === 'processing') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">En cours</Badge>;
    }
    if (operation.status === 'failed') {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Échec</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700">Succès</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              File d'attente de nouvelles tentatives
            </CardTitle>
            <CardDescription>
              {queuedOperations.length === 0
                ? "Aucune opération en attente de nouvelle tentative"
                : `${queuedOperations.length} opération(s) en attente de nouvelle tentative`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 px-2"
            >
              <RefreshCw size={16} />
            </Button>
            {queuedOperations.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={processQueue}
                  className="h-8 gap-1 text-xs"
                >
                  <Play size={14} />
                  Exécuter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearQueue}
                  className="h-8 px-2 text-xs"
                >
                  <Trash2 size={14} />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queuedOperations.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <Check className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-2">Aucune opération en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-2">
              <div className="p-3 rounded-md bg-slate-50">
                <div className="text-sm font-medium">Taux de réussite</div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress 
                    value={stats.successRate} 
                    className="h-2 flex-1"
                  />
                  <span className="text-sm tabular-nums">
                    {Math.round(stats.successRate)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-md bg-slate-50">
                <div className="text-sm font-medium">Statistiques</div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                  <div>Succès: <span className="font-medium">{stats.successful}</span></div>
                  <div>Échecs: <span className="font-medium">{stats.failed}</span></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {queuedOperations.map((operation) => (
                <div
                  key={operation.id}
                  className="flex items-start justify-between p-3 rounded-md border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-blue-500" />
                        <span className="text-sm font-medium truncate">
                          {operation.context || "Opération Notion"}
                        </span>
                      </div>
                      {getStatusBadge(operation)}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div>
                        Tentative {operation.attempts}/{operation.maxAttempts}
                      </div>
                      <div>
                        {formatRelativeTime(operation.timestamp)}
                      </div>
                    </div>
                    
                    {operation.nextRetry && (
                      <div className="mt-1 text-xs">
                        Prochaine tentative: {new Date(operation.nextRetry).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RetryQueueMonitor;
