
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionErrorsList } from '@/components/notion/error';
import { RetryQueueStatus } from '@/components/notion/error';
import { useNotionErrorService, useRetryQueue } from '@/services/notion/errorHandling';
import { Badge } from '@/components/ui/badge';

interface NotionErrorMonitorProps {
  title?: string;
  maxErrors?: number;
  showRetryQueue?: boolean;
  compact?: boolean;
}

const NotionErrorMonitor: React.FC<NotionErrorMonitorProps> = ({
  title = "Moniteur d'erreurs Notion",
  maxErrors = 3,
  showRetryQueue = true,
  compact = false
}) => {
  const { errors } = useNotionErrorService();
  const { stats, processQueue } = useRetryQueue();
  
  const hasErrors = errors.length > 0;
  const hasQueuedOperations = stats.pendingOperations > 0;
  
  // Pour un affichage compact
  if (compact) {
    if (!hasErrors && !hasQueuedOperations) return null;
    
    return (
      <div className="bg-white p-3 rounded-md border shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">{title}</h3>
          
          {hasErrors && (
            <Badge variant="destructive" className="ml-2">
              {errors.length} erreur{errors.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          {hasErrors && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {errors.length} erreur{errors.length > 1 ? 's' : ''} détectée{errors.length > 1 ? 's' : ''}
            </div>
          )}
          
          {showRetryQueue && hasQueuedOperations && (
            <RetryQueueStatus compact={true} />
          )}
        </div>
      </div>
    );
  }
  
  // Affichage standard
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          
          {showRetryQueue && hasQueuedOperations && (
            <RetryQueueStatus />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <NotionErrorsList maxItems={maxErrors} onRetryAll={processQueue} />
      </CardContent>
    </Card>
  );
};

export default NotionErrorMonitor;
