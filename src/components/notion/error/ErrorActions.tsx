
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Database, AlertTriangle } from 'lucide-react';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling';

interface ErrorActionsProps {
  error: NotionError;
  onRetry?: () => void;
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
  // Déterminer l'action principale en fonction du type d'erreur
  const getPrimaryAction = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
        return {
          label: "Configurer",
          icon: <Settings className="h-4 w-4 mr-2" />,
          action: onConfigure,
          variant: "default" as const
        };
        
      case NotionErrorType.DATABASE:
        return {
          label: "Vérifier la structure",
          icon: <Database className="h-4 w-4 mr-2" />,
          action: onRunDiagnostic,
          variant: "default" as const
        };
        
      case NotionErrorType.NETWORK:
      case NotionErrorType.RATE_LIMIT:
      default:
        return {
          label: isRetrying ? "Réessai en cours..." : "Réessayer",
          icon: <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />,
          action: onRetry,
          variant: "default" as const,
          disabled: isRetrying
        };
    }
  };
  
  const primaryAction = getPrimaryAction();
  
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Button
        variant={primaryAction.variant}
        onClick={primaryAction.action}
        disabled={primaryAction.disabled}
        className="w-full sm:w-auto"
      >
        {primaryAction.icon}
        {primaryAction.label}
      </Button>
      
      {/* Actions secondaires */}
      {onRunDiagnostic && primaryAction.label !== "Vérifier la structure" && (
        <Button
          variant="outline"
          onClick={onRunDiagnostic}
          className="w-full sm:w-auto"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Diagnostiquer
        </Button>
      )}
      
      {onRetry && primaryAction.label !== "Réessayer" && primaryAction.label !== "Réessai en cours..." && (
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? "Réessai en cours..." : "Réessayer"}
        </Button>
      )}
    </div>
  );
};

export default ErrorActions;
