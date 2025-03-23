
import React from 'react';
import { AlertTriangle, FileWarning, ServerCrash, Database } from 'lucide-react';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling';

interface ErrorHeaderProps {
  error: NotionError | null;
  onClose?: () => void;
}

const ErrorHeader: React.FC<ErrorHeaderProps> = ({ error, onClose }) => {
  if (!error) return null;
  
  const getErrorIcon = () => {
    switch (error.type) {
      case NotionErrorType.API:
        return <ServerCrash className="h-5 w-5 text-red-500" />;
      case NotionErrorType.CORS:
        return <FileWarning className="h-5 w-5 text-amber-500" />;
      case NotionErrorType.DATABASE:
        return <Database className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getErrorTitle = () => {
    switch (error.type) {
      case NotionErrorType.API:
        return "Erreur API Notion";
      case NotionErrorType.CORS:
        return "Erreur de connexion Notion";
      case NotionErrorType.DATABASE:
        return "Erreur de base de données Notion";
      default:
        return "Erreur Notion";
    }
  };
  
  const getErrorDescription = () => {
    switch (error.type) {
      case NotionErrorType.API:
        return "Une requête vers l'API Notion a échoué";
      case NotionErrorType.CORS:
        return "Impossible de se connecter directement à l'API Notion depuis le navigateur";
      case NotionErrorType.DATABASE:
        return "Problème avec la structure de la base de données Notion";
      default:
        return error.message || "Une erreur s'est produite lors de l'interaction avec Notion";
    }
  };
  
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">
        {getErrorIcon()}
      </div>
      <div className="flex-grow">
        <h3 className="text-sm font-medium text-gray-900">
          {getErrorTitle()}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {getErrorDescription()}
        </p>
      </div>
    </div>
  );
};

export default ErrorHeader;
