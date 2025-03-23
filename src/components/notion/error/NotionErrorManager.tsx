
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NotionError } from '@/services/notion/errorHandling';
import { ErrorHeader } from '@/components/notion/error';
import { ErrorActions } from '@/components/notion/error';
import { ErrorDiagnostics } from '@/components/notion/error';
import { RetryQueueStatus } from '@/components/notion/error';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotionErrorDetails from './NotionErrorDetails';

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
              <NotionErrorDetails 
                error={error}
                onRetry={handleRetry}
                onClose={onClose}
              />
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
    </Card>
  );
};

export default NotionErrorManager;
