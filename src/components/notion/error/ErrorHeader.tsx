
import React from 'react';
import { NotionError, NotionErrorType, NotionErrorSeverity } from '@/services/notion/errorHandling';
import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ErrorHeaderProps {
  error: NotionError;
  showType?: boolean;
}

const ErrorHeader: React.FC<ErrorHeaderProps> = ({ 
  error,
  showType = true
}) => {
  // Obtenir l'icône en fonction du type et de la sévérité
  const getIcon = () => {
    if (error.severity === NotionErrorSeverity.ERROR) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    if (error.severity === NotionErrorSeverity.WARNING) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    
    if (error.severity === NotionErrorSeverity.INFO) {
      return <Info className="h-5 w-5 text-blue-500" />;
    }
    
    // Icône par défaut ou basée sur le type
    switch (error.type) {
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
        return <XCircle className="h-5 w-5 text-red-500" />;
        
      case NotionErrorType.NETWORK:
      case NotionErrorType.DATABASE:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        
      case NotionErrorType.RATE_LIMIT:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
        
      default:
        return <AlertTriangle className="h-5 w-5 text-slate-500" />;
    }
  };
  
  // Obtenir le libellé du type d'erreur
  const getTypeLabel = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return "Erreur d'authentification";
      case NotionErrorType.NETWORK:
        return "Erreur réseau";
      case NotionErrorType.RATE_LIMIT:
        return "Limite d'API dépassée";
      case NotionErrorType.PERMISSION:
        return "Erreur de permission";
      case NotionErrorType.DATABASE:
        return "Erreur de base de données";
      case NotionErrorType.VALIDATION:
        return "Erreur de validation";
      case NotionErrorType.SERVER:
        return "Erreur serveur";
      default:
        return "Erreur inconnue";
    }
  };
  
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1">
        {getIcon()}
      </div>
      <div>
        <h3 className="font-medium text-base leading-tight">
          {error.message}
        </h3>
        
        {showType && (
          <p className="text-sm text-slate-600 mt-1">
            {getTypeLabel()}
            {error.timestamp && (
              <span className="text-slate-400 ml-2 text-xs">
                {new Date(error.timestamp).toLocaleString()}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorHeader;
