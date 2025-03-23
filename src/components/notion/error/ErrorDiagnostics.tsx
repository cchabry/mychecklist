
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, AlertTriangle, KeyRound, ServerOff, RefreshCw } from 'lucide-react';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling';

interface ErrorDiagnosticsProps {
  error: NotionError;
  onRunDiagnostic?: () => void;
}

const ErrorDiagnostics: React.FC<ErrorDiagnosticsProps> = ({
  error,
  onRunDiagnostic
}) => {
  // Déterminer les actions de diagnostic recommandées en fonction du type d'erreur
  const getDiagnosticActions = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return {
          title: "Erreur d'authentification",
          description: "Vérifiez vos identifiants Notion et vos permissions d'intégration.",
          actions: [
            {
              label: "Vérifier la clé API",
              icon: <KeyRound className="h-4 w-4 mr-2" />,
              action: onRunDiagnostic
            },
            {
              label: "Tester la connexion",
              icon: <RefreshCw className="h-4 w-4 mr-2" />,
              action: onRunDiagnostic
            }
          ]
        };
        
      case NotionErrorType.DATABASE:
        return {
          title: "Erreur de structure de base de données",
          description: "La structure de la base de données Notion ne correspond pas aux attentes.",
          actions: [
            {
              label: "Analyser la structure",
              icon: <Database className="h-4 w-4 mr-2" />,
              action: onRunDiagnostic
            }
          ]
        };
        
      case NotionErrorType.NETWORK:
      case NotionErrorType.CORS:
      case NotionErrorType.RATE_LIMIT:
        return {
          title: "Erreur de connectivité",
          description: "Problème de connexion avec l'API Notion.",
          actions: [
            {
              label: "Vérifier la connexion",
              icon: <ServerOff className="h-4 w-4 mr-2" />,
              action: onRunDiagnostic
            }
          ]
        };
        
      case NotionErrorType.PERMISSION:
        return {
          title: "Erreur de permissions",
          description: "L'intégration n'a pas les permissions nécessaires sur cette ressource Notion.",
          actions: [
            {
              label: "Vérifier les permissions",
              icon: <KeyRound className="h-4 w-4 mr-2" />,
              action: onRunDiagnostic
            }
          ]
        };
        
      default:
        return {
          title: "Diagnostic général",
          description: "Exécutez un diagnostic complet pour identifier le problème.",
          actions: [
            {
              label: "Diagnostic complet",
              icon: <AlertTriangle className="h-4 w-4 mr-2" />,
              action: onRunDiagnostic
            }
          ]
        };
    }
  };
  
  const { title, description, actions } = getDiagnosticActions();
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      
      <div className="flex flex-col space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={action.action}
            className="justify-start"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground mt-4">
        <p>ID de l'erreur: {error.id}</p>
        <p>Type: {error.type}</p>
        {error.operation && <p>Opération: {error.operation}</p>}
      </div>
    </div>
  );
};

export default ErrorDiagnostics;
