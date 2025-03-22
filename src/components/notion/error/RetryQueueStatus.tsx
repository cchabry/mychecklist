
import React from 'react';
import { useNotionRetryQueue } from '@/services/notion/errorHandling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, AlertTriangle } from 'lucide-react';

const RetryQueueStatus: React.FC = () => {
  const { stats, processNow } = useNotionRetryQueue();
  
  // Si aucune opération en attente, ne rien afficher
  if (stats.totalOperations === 0) {
    return null;
  }
  
  return (
    <Card className="shadow-sm border-slate-200 mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            File d'attente
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-800">
            {stats.totalOperations} opération(s)
          </Badge>
        </div>
        <CardDescription>
          Opérations en attente de nouvel essai
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <p className="text-sm">
            {stats.pendingOperations} opération(s) prête(s) à être traitée(s)
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={processNow}
          disabled={stats.isProcessing || stats.pendingOperations === 0}
          className="flex items-center gap-1"
        >
          <Play size={14} />
          Traiter maintenant
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RetryQueueStatus;
