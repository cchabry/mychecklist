
import React from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useRetryQueue } from '@/services/notion/errorHandling';
import { Button } from '@/components/ui/button';

interface RetryQueueStatusProps {
  compact?: boolean;
  onProcess?: () => void;
}

const RetryQueueStatus: React.FC<RetryQueueStatusProps> = ({
  compact = false,
  onProcess
}) => {
  const { stats, processQueue } = useRetryQueue();
  const hasPendingOperations = stats.pendingOperations > 0;
  
  const handleProcess = async () => {
    if (onProcess) {
      onProcess();
    } else {
      await processQueue();
    }
  };
  
  if (compact) {
    if (!hasPendingOperations) return null;
    
    return (
      <div className="flex items-center gap-2 text-xs">
        <RefreshCw className="h-3 w-3 text-amber-500" />
        <span className="text-amber-700">
          {stats.pendingOperations} opération{stats.pendingOperations > 1 ? 's' : ''} en attente
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-[10px]"
          onClick={handleProcess}
        >
          Traiter
        </Button>
      </div>
    );
  }
  
  if (!hasPendingOperations) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-green-700">File d'attente vide</span>
      </div>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-xs"
      onClick={handleProcess}
    >
      <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
      {stats.pendingOperations} opération{stats.pendingOperations > 1 ? 's' : ''} en attente
    </Button>
  );
};

export default RetryQueueStatus;
