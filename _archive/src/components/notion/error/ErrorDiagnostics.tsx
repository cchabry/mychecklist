
import React from 'react';
import { Button } from '@/components/ui/button';
import { Stethoscope, ServerOff, Link2, CheckCircle, XCircle } from 'lucide-react';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling/types';

interface ErrorDiagnosticsProps {
  error: NotionError;
  onRunDiagnostic?: () => void;
}

const ErrorDiagnostics: React.FC<ErrorDiagnosticsProps> = ({
  error,
  onRunDiagnostic
}) => {
  // Suggérer des actions de diagnostic en fonction du type d'erreur
  const getDiagnosticActions = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return [
          { label: 'Vérifier les identifiants API', icon: <CheckCircle className="h-4 w-4" /> },
          { label: 'Vérifier la configuration d\'intégration', icon: <Link2 className="h-4 w-4" /> }
        ];
        
      case NotionErrorType.NETWORK:
      case NotionErrorType.CORS:
        return [
          { label: 'Vérifier la connexion internet', icon: <ServerOff className="h-4 w-4" /> },
          { label: 'Tester la configuration proxy', icon: <Link2 className="h-4 w-4" /> }
        ];
        
      case NotionErrorType.PERMISSION:
        return [
          { label: 'Vérifier les permissions', icon: <XCircle className="h-4 w-4" /> },
          { label: 'Vérifier l\'accès aux bases', icon: <CheckCircle className="h-4 w-4" /> }
        ];
        
      default:
        return [
          { label: 'Exécuter un diagnostic complet', icon: <Stethoscope className="h-4 w-4" /> }
        ];
    }
  };
  
  const diagnosticActions = getDiagnosticActions();
  
  return (
    <div className="space-y-4">
      <div className="text-sm">
        <p>Diagnostic suggéré pour ce type d'erreur :</p>
      </div>
      
      <div className="space-y-2">
        {diagnosticActions.map((action, index) => (
          <Button 
            key={index}
            variant="outline"
            className="w-full justify-start"
            onClick={onRunDiagnostic}
          >
            <span className="mr-2 text-muted-foreground">{action.icon}</span>
            {action.label}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>Le diagnostic vérifiera la configuration Notion et tentera de déterminer la cause de l'erreur.</p>
      </div>
    </div>
  );
};

export default ErrorDiagnostics;
