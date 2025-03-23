
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  RefreshCw, Clock, X, Check, AlertTriangle, 
  Trash, Play, RotateCcw, Calendar 
} from "lucide-react";
import { format } from 'date-fns';
import { useOperationQueue, QueuedOperation, OperationStatus } from '@/hooks/api/useOperationQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const OperationItem: React.FC<{ 
  operation: QueuedOperation, 
  onRetry: (id: string) => void,
  onRemove: (id: string) => void
}> = ({ operation, onRetry, onRemove }) => {
  return (
    <div className="p-3 border rounded-md mb-2 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium mb-1">
            {operation.entityType} - {operation.entityId || 'Nouveau'}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <OperationTypeDisplay type={operation.operationType} />
            <OperationStatusBadge status={operation.status} />
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(operation.createdAt), 'dd/MM/yyyy HH:mm')}
        </div>
      </div>
      
      {operation.error && (
        <div className="text-xs bg-red-50 p-2 rounded border border-red-100 text-red-700 mb-2">
          {operation.error}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <span>Tentatives: {operation.attempts}/{operation.maxAttempts}</span>
        {operation.lastAttempt && (
          <span>Dernière tentative: {format(new Date(operation.lastAttempt), 'HH:mm:ss')}</span>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        {operation.status === 'error' && (
          <Button variant="outline" size="sm" onClick={() => onRetry(operation.id)}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Réessayer
          </Button>
        )}
        <Button variant="outline" size="sm" className="text-red-600" onClick={() => onRemove(operation.id)}>
          <X className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>
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
  }, [pendingCount, isProcessing, autoRefresh, refreshInterval]);
  
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
            onClick={processQueue} 
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
            onClick={clearQueue}
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
