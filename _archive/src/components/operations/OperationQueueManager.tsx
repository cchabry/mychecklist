
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  RefreshCw, Clock, X, Check, AlertTriangle, 
  Trash, Play, RotateCcw, Calendar, Hourglass, 
  FastForward, MoreHorizontal
} from "lucide-react";
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useOperationQueue, QueuedOperation, OperationStatus, RetryStrategy } from '@/hooks/api/useOperationQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const getRetryStrategyLabel = (strategy: RetryStrategy): string => {
  switch (strategy) {
    case 'immediate': return 'Immédiat';
    case 'fixed': return 'Délai fixe';
    case 'linear': return 'Progression linéaire';
    case 'exponential': return 'Exponentiel';
    default: return 'Inconnu';
  }
};

const OperationStatusBadge: React.FC<{ status: OperationStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          En cours
        </Badge>
      );
    case 'success':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Succès
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Erreur
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const OperationTypeDisplay: React.FC<{ type: QueuedOperation['operationType'] }> = ({ type }) => {
  switch (type) {
    case 'create':
      return <Badge className="bg-green-50 text-green-700 border-green-200">Création</Badge>;
    case 'update':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Mise à jour</Badge>;
    case 'delete':
      return <Badge className="bg-red-50 text-red-700 border-red-200">Suppression</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

const RetryStrategyDisplay: React.FC<{ strategy: RetryStrategy }> = ({ strategy }) => {
  let color = '';
  
  switch (strategy) {
    case 'immediate':
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'fixed':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'linear':
      color = 'bg-teal-50 text-teal-700 border-teal-200';
      break;
    case 'exponential':
      color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={color}>
            {getRetryStrategyLabel(strategy)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {strategy === 'immediate' && "Réessaie immédiatement sans attente"}
            {strategy === 'fixed' && "Utilise toujours le même délai entre les essais"}
            {strategy === 'linear' && "Augmente le délai de façon linéaire (× 1, × 2, × 3...)"}
            {strategy === 'exponential' && "Augmente le délai de façon exponentielle (× 1, × 2, × 4, × 8...)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface RetryTimerProps {
  nextRetryTime?: string;
  status: OperationStatus;
}

const RetryTimer: React.FC<RetryTimerProps> = ({ nextRetryTime, status }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!nextRetryTime || status !== 'pending') {
      setTimeLeft('');
      setProgress(0);
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const targetTime = new Date(nextRetryTime).getTime();
      const diff = targetTime - now;
      
      if (diff <= 0) {
        setTimeLeft('Maintenant');
        setProgress(100);
        return;
      }
      
      // Formatage du temps restant
      setTimeLeft(formatDistance(targetTime, now, { locale: fr, addSuffix: true }));
      
      // Calculer le pourcentage de progression
      // Supposons qu'un délai est typiquement entre 1 et 30 secondes
      const maxDelay = 30000; // 30s
      const elapsed = maxDelay - diff;
      const progressValue = Math.max(0, Math.min(100, (elapsed / maxDelay) * 100));
      setProgress(progressValue);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [nextRetryTime, status]);
  
  if (!nextRetryTime || status !== 'pending') {
    return null;
  }
  
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
        <span className="flex items-center">
          <Hourglass className="h-3 w-3 mr-1" />
          Prochaine tentative:
        </span>
        <span>{timeLeft}</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
};

const OperationItem: React.FC<{ 
  operation: QueuedOperation, 
  onRetry: (id: string) => void,
  onRemove: (id: string) => void
}> = ({ operation, onRetry, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-3 border rounded-md mb-2 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium mb-1">
            {operation.entityType} - {operation.entityId || 'Nouveau'}
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <OperationTypeDisplay type={operation.operationType} />
            <OperationStatusBadge status={operation.status} />
            <RetryStrategyDisplay strategy={operation.retryStrategy} />
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(operation.createdAt), 'dd/MM/yyyy HH:mm')}
        </div>
      </div>
      
      <RetryTimer nextRetryTime={operation.nextRetryTime} status={operation.status} />
      
      {operation.error && (
        <div className="text-xs bg-red-50 p-2 rounded border border-red-100 text-red-700 my-2">
          {operation.error}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <span>Tentatives: {operation.attempts}/{operation.maxAttempts}</span>
        {operation.lastAttempt && (
          <span>Dernière tentative: {format(new Date(operation.lastAttempt), 'HH:mm:ss')}</span>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500"
        >
          {expanded ? 'Moins de détails' : 'Plus de détails'}
          <MoreHorizontal className="h-3 w-3 ml-1" />
        </Button>
        
        <div className="flex gap-2">
          {operation.status === 'error' && (
            <Button variant="outline" size="sm" onClick={() => onRetry(operation.id)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Réessayer
            </Button>
          )}
          
          {operation.status === 'pending' && (
            <Button variant="outline" size="sm" onClick={() => onRetry(operation.id)}>
              <FastForward className="h-4 w-4 mr-1" />
              Forcer
            </Button>
          )}
          
          <Button variant="outline" size="sm" className="text-red-600" onClick={() => onRemove(operation.id)}>
            <X className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      </div>
      
      {expanded && operation.payload && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
          <p className="font-semibold mb-1">Données:</p>
          <pre>{JSON.stringify(operation.payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

interface OperationQueueManagerProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const OperationQueueManager: React.FC<OperationQueueManagerProps> = ({ 
  autoRefresh = true,
  refreshInterval = 10000
}) => {
  const { 
    operations, 
    pendingCount,
    errorCount,
    successCount,
    isProcessing,
    lastSync,
    processQueue,
    retryOperation,
    removeOperation,
    clearQueue
  } = useOperationQueue();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Traitement automatique périodique
  useEffect(() => {
    if (!autoRefresh) return;
    
    const intervalId = setInterval(() => {
      if (pendingCount > 0 && !isProcessing) {
        processQueue();
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [pendingCount, isProcessing, autoRefresh, refreshInterval, processQueue]);
  
  // Filtrer les opérations selon l'onglet actif
  const filteredOperations = operations.filter(op => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return op.status === "pending";
    if (activeTab === "processing") return op.status === "processing";
    if (activeTab === "success") return op.status === "success";
    if (activeTab === "error") return op.status === "error";
    return true;
  });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>File d'attente des opérations</CardTitle>
            <CardDescription>
              Gestion des opérations en attente de synchronisation
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={`${pendingCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'}`}>
              <Clock className="h-3 w-3 mr-1" />
              {pendingCount} en attente
            </Badge>
            <Badge variant="outline" className={`${errorCount > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50'}`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {errorCount} en erreur
            </Badge>
            <Badge variant="outline" className={`${successCount > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
              <Check className="h-3 w-3 mr-1" />
              {successCount} réussies
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">Tous ({operations.length})</TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({operations.filter(op => op.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                En cours ({operations.filter(op => op.status === "processing").length})
              </TabsTrigger>
              <TabsTrigger value="success">
                Succès ({operations.filter(op => op.status === "success").length})
              </TabsTrigger>
              <TabsTrigger value="error">
                Erreurs ({operations.filter(op => op.status === "error").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {filteredOperations.length === 0 ? (
          <div className="text-center p-8">
            <div className="text-gray-400 mb-2">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-1">Aucune opération</h3>
            <p className="text-sm text-gray-500">
              {activeTab === "all" 
                ? "La file d'attente est vide."
                : `Aucune opération avec le statut "${activeTab}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOperations.map(operation => (
              <OperationItem 
                key={operation.id}
                operation={operation}
                onRetry={retryOperation}
                onRemove={removeOperation}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between flex-wrap gap-2">
        <div className="text-xs text-gray-500 flex items-center">
          {lastSync 
            ? `Dernière synchronisation: ${format(new Date(lastSync), 'dd/MM/yyyy HH:mm:ss')}` 
            : 'Aucune synchronisation récente'}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => processQueue()} 
            disabled={isProcessing || pendingCount === 0}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Traiter la file
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600"
            onClick={() => clearQueue()}
            disabled={operations.length === 0}
          >
            <Trash className="h-4 w-4 mr-1" />
            Vider la file
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OperationQueueManager;
