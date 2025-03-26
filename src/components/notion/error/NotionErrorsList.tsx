
import React from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { useNotionErrorService } from '@/services/notion/errorHandling';
import { NotionError, NotionErrorSeverity } from '@/services/notion/types/unified';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface NotionErrorsListProps {
  limit?: number;
  showClearButton?: boolean;
  showHeader?: boolean;
  maxHeight?: string;
  className?: string;
}

const NotionErrorsList: React.FC<NotionErrorsListProps> = ({
  limit = 10,
  showClearButton = true,
  showHeader = true,
  maxHeight = '400px',
  className = ''
}) => {
  const { errors, clearErrors, getUserFriendlyMessage } = useNotionErrorService();
  
  // Filtrer et limiter les erreurs
  const displayErrors = errors.slice(0, limit);
  
  // Déterminer la sévérité globale
  const hasCriticalErrors = errors.some(err => err.severity === NotionErrorSeverity.CRITICAL);
  const hasErrors = errors.some(err => err.severity === NotionErrorSeverity.ERROR);
  const hasWarnings = errors.some(err => err.severity === NotionErrorSeverity.WARNING);
  
  // Obtenir l'icône correspondant à la sévérité
  const getSeverityIcon = (severity: NotionErrorSeverity) => {
    switch (severity) {
      case NotionErrorSeverity.CRITICAL:
      case NotionErrorSeverity.ERROR:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case NotionErrorSeverity.WARNING:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Obtenir la classe de couleur correspondant à la sévérité
  const getSeverityClass = (severity: NotionErrorSeverity) => {
    switch (severity) {
      case NotionErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case NotionErrorSeverity.ERROR:
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case NotionErrorSeverity.WARNING:
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case NotionErrorSeverity.INFO:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  // Si pas d'erreurs
  if (errors.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Journal d'erreurs Notion</CardTitle>
            <CardDescription>Aucune erreur à afficher</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Tous les systèmes fonctionnent normalement
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Journal d'erreurs Notion</CardTitle>
              <CardDescription>
                {errors.length} {errors.length > 1 ? 'erreurs' : 'erreur'} récente{errors.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            {hasCriticalErrors && (
              <Badge variant="destructive">Erreur critique</Badge>
            )}
            {!hasCriticalErrors && hasErrors && (
              <Badge variant="destructive">Erreur</Badge>
            )}
            {!hasCriticalErrors && !hasErrors && hasWarnings && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                Avertissement
              </Badge>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={`p-0 overflow-y-auto ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
        <Accordion type="multiple" className="w-full">
          {displayErrors.map((error, index) => (
            <AccordionItem value={error.id} key={error.id} className="border-b">
              <AccordionTrigger className={`px-4 py-2 hover:no-underline ${getSeverityClass(error.severity)}`}>
                <div className="flex items-center gap-2 text-sm">
                  {getSeverityIcon(error.severity)}
                  <span className="font-medium">{error.message}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 py-2 text-sm space-y-2">
                  <p>
                    <span className="font-semibold">Message: </span>
                    {getUserFriendlyMessage(error)}
                  </p>
                  
                  <p>
                    <span className="font-semibold">Date: </span>
                    {format(new Date(error.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                  </p>
                  
                  {error.operation && (
                    <p>
                      <span className="font-semibold">Opération: </span>
                      {error.operation}
                    </p>
                  )}
                  
                  {error.context && (
                    <p>
                      <span className="font-semibold">Contexte: </span>
                      {typeof error.context === 'string' 
                        ? error.context 
                        : JSON.stringify(error.context, null, 2)}
                    </p>
                  )}
                  
                  {error.retryable && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Peut être réessayée
                    </Badge>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      
      {showClearButton && errors.length > 0 && (
        <CardFooter className="px-4 py-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto" 
            onClick={clearErrors}
          >
            <X className="h-4 w-4 mr-1" />
            Effacer les erreurs
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NotionErrorsList;
