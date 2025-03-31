
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NotionError } from '@/services/notion/errorHandling';
import ErrorHeader from './ErrorHeader';
import ErrorActions from './ErrorActions';
import ErrorDiagnostics from './ErrorDiagnostics';
import RetryQueueStatus from './RetryQueueStatus';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotionErrorDetails from './NotionErrorDetails';
import { Button } from '@/components/ui/button';

interface NotionErrorManagerProps {
  error: NotionError;
  onRetry?: () => Promise<void>;
  onConfigure?: () => void;
  onDiagnostic?: () => void;
  onClose?: () => void;
  showRetryQueue?: boolean;
}

const NotionErrorManager: React.FC<NotionErrorManagerProps> = ({
  error,
  onRetry,
  onConfigure,
  onDiagnostic,
  onClose,
  showRetryQueue = true
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Gérer le retry avec gestion de l'état
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleShowDetails = () => {
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  // Formater le contexte pour l'affichage
  const formatContext = (context?: string | Record<string, any>): React.ReactNode => {
    if (!context) return null;
    
    if (typeof context === 'string') {
      return <span>{context}</span>;
    }
    
    // Si c'est un objet, afficher une représentation simplifiée
    try {
      return <span>{JSON.stringify(context, null, 2)}</span>;
    } catch (e) {
      return <span>[Contexte complexe]</span>;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <ErrorHeader error={error} />
          
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actions">
              <div className="space-y-4">
                <ErrorActions
                  error={error}
                  onRetry={handleRetry}
                  onConfigure={onConfigure}
                  onRunDiagnostic={onDiagnostic}
                  isRetrying={isRetrying}
                />
                
                {showRetryQueue && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">File d'attente des opérations</h4>
                      <RetryQueueStatus />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShowDetails}
                >
                  Afficher les détails complets
                </Button>
                
                <div className="text-sm">
                  <p><strong>Type:</strong> {error.type}</p>
                  {error.operation && <p><strong>Opération:</strong> {error.operation}</p>}
                  {error.context && (
                    <p>
                      <strong>Contexte:</strong> {formatContext(error.context)}
                    </p>
                  )}
                  <p><strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}</p>
                  <p><strong>ID:</strong> {error.id}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="diagnostic">
              <ErrorDiagnostics 
                error={error}
                onRunDiagnostic={onDiagnostic}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      <NotionErrorDetails 
        error={error}
        context={error.context}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onRetry={handleRetry}
      />
    </Card>
  );
};

export default NotionErrorManager;
