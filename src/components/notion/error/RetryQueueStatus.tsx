
import React from 'react';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { Button } from '@/components/ui/button';
import { RefreshCw, PlayCircle } from 'lucide-react';

interface RetryQueueStatusProps {
  compact?: boolean;
  showButton?: boolean;
}

const RetryQueueStatus: React.FC<RetryQueueStatusProps> = ({
  compact = false,
  showButton = true
}) => {
  const { stats, processQueue } = useRetryQueue();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const hasOperations = stats.pendingOperations > 0;
  
  const handleProcess = async () => {
    setIsProcessing(true);
    await processQueue();
    setIsProcessing(false);
  };
  
  // Version compacte pour les barres d'état
  if (compact) {
    if (!hasOperations) return null;
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {stats.pendingOperations} opération{stats.pendingOperations > 1 ? 's' : ''} en attente
        </span>
        
        {showButton && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleProcess}
            disabled={isProcessing}
            className="h-6 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${isProcessing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }
  
  // Version standard
  if (!hasOperations) {
    return (
      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 inline-flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
        File d'attente vide
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span>
        {stats.pendingOperations} opération{stats.pendingOperations > 1 ? 's' : ''} en attente
      </div>
      
      {showButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleProcess}
          disabled={isProcessing}
          className="h-7 px-2"
        >
          {isProcessing ? (
            <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5 mr-1" />
          )}
          Exécuter
        </Button>
      )}
    </div>
  );
};

export default RetryQueueStatus;
