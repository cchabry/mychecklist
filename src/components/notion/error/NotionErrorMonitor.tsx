
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { NotionErrorsList, RetryQueueStatus } from '.';
import { useNotionErrorService, useRetryQueue } from '@/services/notion/errorHandling';
import { NotionErrorSeverity } from '@/services/notion/types/unified';

interface NotionErrorMonitorProps {
  showButton?: boolean;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonLabel?: string;
  buttonClassName?: string;
  showBadge?: boolean;
}

const NotionErrorMonitor: React.FC<NotionErrorMonitorProps> = ({
  showButton = true,
  buttonVariant = 'outline',
  buttonLabel = 'Moniteur d\'erreurs',
  buttonClassName = '',
  showBadge = true
}) => {
  const [open, setOpen] = useState(false);
  const { errors } = useNotionErrorService();
  const { stats } = useRetryQueue();
  
  // Vérifier s'il y a des erreurs actives
  const hasCriticalErrors = errors.some(err => err.severity === NotionErrorSeverity.CRITICAL);
  const hasErrors = errors.some(err => err.severity === NotionErrorSeverity.ERROR);
  const hasWarnings = errors.some(err => err.severity === NotionErrorSeverity.WARNING);
  const hasPendingRetries = stats.pending > 0;
  
  // Déterminer le style du bouton
  let displayVariant = buttonVariant;
  if (hasCriticalErrors) {
    displayVariant = 'destructive';
  } else if (hasErrors) {
    displayVariant = 'destructive';
  } else if (hasWarnings || hasPendingRetries) {
    displayVariant = 'secondary';
  }
  
  // Si aucune erreur ou avertissement et pas de button demandé, ne rien afficher
  if (!showButton && !hasErrors && !hasWarnings && !hasPendingRetries) {
    return null;
  }
  
  return (
    <>
      {showButton && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={displayVariant} className={buttonClassName}>
              {hasCriticalErrors || hasErrors ? (
                <AlertCircle className="h-4 w-4 mr-1" />
              ) : hasPendingRetries ? (
                <Activity className="h-4 w-4 mr-1" />
              ) : null}
              {buttonLabel}
              {showBadge && (errors.length > 0 || stats.pending > 0) && (
                <Badge variant="outline" className="ml-2 bg-primary/10">
                  {errors.length + stats.pending}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Moniteur des erreurs Notion</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-2">
              <RetryQueueStatus showDetails className="max-w-none" />
              <NotionErrorsList showHeader={false} className="max-w-none" maxHeight="400px" />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {!showButton && (hasErrors || hasWarnings || hasPendingRetries) && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Badge 
              variant={hasCriticalErrors || hasErrors ? "destructive" : "secondary"}
              className="cursor-pointer"
            >
              {hasCriticalErrors || hasErrors ? (
                <AlertCircle className="h-3 w-3 mr-1" />
              ) : (
                <Activity className="h-3 w-3 mr-1" />
              )}
              {errors.length + stats.pending} problème{errors.length + stats.pending > 1 ? 's' : ''}
            </Badge>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Moniteur des erreurs Notion</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-2">
              <RetryQueueStatus showDetails className="max-w-none" />
              <NotionErrorsList showHeader={false} className="max-w-none" maxHeight="400px" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default NotionErrorMonitor;
