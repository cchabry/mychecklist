
import React from 'react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

const RetryQueueMonitor: React.FC = () => {
  const { queuedOperations, stats, processQueue, clearQueue } = useRetryQueue();
  
  if (queuedOperations.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          File d'attente de nouvelles tentatives
          <Badge variant="secondary" className="ml-2">
            {queuedOperations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {queuedOperations.map((op) => (
            <div key={op.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div>
                <p className="text-sm font-medium">{op.context}</p>
                <p className="text-xs text-gray-500">
                  Tentative {op.attempts}/{op.maxAttempts} • 
                  Dernière: {new Date(op.lastAttempt).toLocaleTimeString()}
                </p>
              </div>
              
              <Badge 
                variant={op.attempts < op.maxAttempts ? "outline" : "destructive"} 
                className="ml-auto"
              >
                {op.attempts < op.maxAttempts ? "En attente" : "Critique"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearQueue}
          className="gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Vider
        </Button>
        
        <Button 
          size="sm" 
          onClick={processQueue}
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer maintenant
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RetryQueueMonitor;
