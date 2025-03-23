
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Stethoscope, RotateCcw } from 'lucide-react';
import { NotionError } from '@/services/notion/errorHandling/types';

interface ErrorActionsProps {
  error: NotionError;
  onRetry?: () => Promise<void>;
  onConfigure?: () => void;
  onRunDiagnostic?: () => void;
  isRetrying?: boolean;
}

const ErrorActions: React.FC<ErrorActionsProps> = ({
  error,
  onRetry,
  onConfigure,
  onRunDiagnostic,
  isRetrying = false
}) => {
  return (
    <div className="space-y-3">
      {error.retryable && onRetry && (
        <Button
          className="w-full"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Nouvelle tentative en cours...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réessayer l'opération
            </>
          )}
        </Button>
      )}
      
      {onConfigure && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onConfigure}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configurer Notion
        </Button>
      )}
      
      {onRunDiagnostic && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onRunDiagnostic}
        >
          <Stethoscope className="mr-2 h-4 w-4" />
          Exécuter un diagnostic
        </Button>
      )}
    </div>
  );
};

export default ErrorActions;
