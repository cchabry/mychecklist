import React from 'react';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling/types';
import { AlertTriangle, AlertCircle, KeyRound, ServerCrash, Database, Clock } from 'lucide-react';

interface ErrorHeaderProps {
  error: NotionError;
}

const ErrorHeader: React.FC<ErrorHeaderProps> = ({ error }) => {
  // Déterminer l'icône et la couleur en fonction du type d'erreur
  const getErrorIcon = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return <KeyRound className="h-5 w-5 text-amber-500" />;
        
      case NotionErrorType.PERMISSION:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        
      case NotionErrorType.RATE_LIMIT:
        return <Clock className="h-5 w-5 text-amber-500" />;
        
      case NotionErrorType.DATABASE:
        return <Database className="h-5 w-5 text-amber-500" />;
        
      case NotionErrorType.API:
        return <ServerCrash className="h-5 w-5 text-red-500" />;
        
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  // Formater l'horodatage
  const formattedTime = new Date(error.timestamp).toLocaleString();
  
  // Déterminer le titre en fonction du type d'erreur
  const getErrorTitle = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return "Erreur d'authentification Notion";
        
      case NotionErrorType.PERMISSION:
        return "Erreur de permission Notion";
        
      case NotionErrorType.RATE_LIMIT:
        return "Limite de requêtes atteinte";
        
      case NotionErrorType.DATABASE:
        return "Erreur de base de données";
        
      case NotionErrorType.NETWORK:
        return "Erreur de connexion réseau";
        
      case NotionErrorType.CORS:
        return "Erreur de configuration CORS";
        
      default:
        return "Erreur API Notion";
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {getErrorIcon()}
        
        <div>
          <h3 className="font-medium">{getErrorTitle()}</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
        {error.operation && (
          <span className="bg-slate-100 px-2 py-1 rounded">
            Opération: {error.operation}
          </span>
        )}
        
        <span className="bg-slate-100 px-2 py-1 rounded">
          {new Date(error.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ErrorHeader;
