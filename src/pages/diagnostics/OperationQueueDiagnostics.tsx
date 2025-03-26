
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotionErrorManager, RetryQueueStatus } from '@/components/notion/error';
import { useNotionErrorService, useRetryQueue, NotionErrorType, NotionErrorSeverity } from '@/services/notion/errorHandling';
import { createNotionError } from '@/services/notion/errorHandling';

const OperationQueueDiagnostics: React.FC = () => {
  const { reportError, errors } = useNotionErrorService();
  const { addOperation } = useRetryQueue();
  const [lastTestId, setLastTestId] = useState<string | null>(null);

  // Opération qui réussit après un délai
  const successfulOperation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Opération réussie complétée');
    return { success: true, message: 'Opération réussie complétée' };
  };

  // Opération qui échoue après un délai
  const failingOperation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new Error('Échec de l\'opération');
  };

  // Opération qui échoue 2 fois puis réussit
  const eventuallySuccessfulOperation = async () => {
    const attemptCount = parseInt(localStorage.getItem('retryAttempt') || '0', 10);
    localStorage.setItem('retryAttempt', (attemptCount + 1).toString());
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (attemptCount < 2) {
      throw new Error(`Échec temporaire (tentative ${attemptCount + 1}/3)`);
    }
    
    localStorage.removeItem('retryAttempt');
    return { success: true, message: 'Réussi après plusieurs tentatives' };
  };

  // Créer et ajouter une opération réussie
  const handleAddSuccessfulOperation = () => {
    const id = addOperation(successfulOperation, 'Opération de test - Réussite');
    setLastTestId(id);
  };

  // Créer et ajouter une opération qui échoue
  const handleAddFailingOperation = () => {
    const id = addOperation(failingOperation, 'Opération de test - Échec');
    setLastTestId(id);
  };

  // Créer et ajouter une opération qui échoue puis réussit
  const handleAddEventualSuccessOperation = () => {
    localStorage.setItem('retryAttempt', '0');
    const id = addOperation(eventuallySuccessfulOperation, 'Opération de test - Réussite éventuelle');
    setLastTestId(id);
  };

  // Créer et signaler une erreur réessayable
  const handleCreateRetryableError = () => {
    const error = createNotionError(
      'Erreur de test réessayable',
      NotionErrorType.NETWORK,
      {
        retryable: true,
        severity: NotionErrorSeverity.ERROR,
        context: 'Test de file d\'attente',
        operation: 'Tests de diagnostic'
      }
    );
    
    reportError(error);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Diagnostics de la file d'attente d'opérations</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Actions de test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={handleAddSuccessfulOperation}
            >
              Ajouter opération réussie
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAddFailingOperation}
            >
              Ajouter opération échouée
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAddEventualSuccessOperation}
            >
              Ajouter opération qui réussit après 2 essais
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleCreateRetryableError}
          >
            Créer erreur réessayable
          </Button>
          
          {lastTestId && (
            <p className="text-sm text-muted-foreground">
              Dernière opération ajoutée: <code>{lastTestId}</code>
            </p>
          )}
        </CardContent>
      </Card>
      
      <RetryQueueStatus showDetails className="w-full" />
      
      {errors.length > 0 && errors.map(error => (
        <NotionErrorManager 
          key={error.id} 
          error={error}
          onRetry={error.retryable ? async () => console.log('Retry from manager') : undefined}
        />
      ))}
    </div>
  );
};

export default OperationQueueDiagnostics;
