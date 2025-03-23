
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { operationMode } from '@/services/operationMode';

interface AuditNotFoundProps {
  projectId?: string;
  auditId?: string;
  reason?: string;
  onRetry?: () => void;
}

/**
 * Affiche un message d'erreur lorsqu'un audit n'est pas trouvé
 */
const AuditNotFound: React.FC<AuditNotFoundProps> = ({
  projectId,
  auditId,
  reason = "L'audit demandé n'a pas été trouvé",
  onRetry
}) => {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    // Réinitialiser le mode pour forcer une nouvelle tentative
    operationMode.enableRealMode();
    
    // Appeler le callback de retry si fourni
    if (onRetry) {
      onRetry();
    }
  };
  
  const handleBackToProject = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    } else {
      navigate('/');
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Audit introuvable</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {reason}
            {auditId && (
              <div className="mt-2 text-sm text-muted-foreground">
                ID d'audit: <code className="text-xs bg-muted p-1 rounded">{auditId}</code>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBackToProject}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au projet
        </Button>
        <Button 
          onClick={handleRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuditNotFound;
