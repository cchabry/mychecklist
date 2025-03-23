
import React, { useState } from 'react';
import { useNotionErrorService } from '@/hooks/notion/useNotionErrorService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { NotionError, NotionErrorSeverity, NotionErrorType } from '@/services/notion/errorHandling/types';

const NotionErrorMonitor: React.FC = () => {
  const { errors, clearErrors } = useNotionErrorService();
  const [expanded, setExpanded] = useState(false);
  
  if (errors.length === 0) {
    return null;
  }
  
  const getSeverityIcon = (severity: NotionErrorSeverity) => {
    switch (severity) {
      case NotionErrorSeverity.CRITICAL:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case NotionErrorSeverity.ERROR:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getSeverityColor = (severity: NotionErrorSeverity) => {
    switch (severity) {
      case NotionErrorSeverity.CRITICAL:
        return "bg-red-100 text-red-800";
      case NotionErrorSeverity.ERROR:
        return "bg-amber-100 text-amber-800";
      case NotionErrorSeverity.WARNING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  const getErrorTypeName = (type: NotionErrorType) => {
    switch (type) {
      case NotionErrorType.NETWORK:
        return "Réseau";
      case NotionErrorType.AUTH:
        return "Authentification";
      case NotionErrorType.PERMISSION:
        return "Permission";
      case NotionErrorType.RATE_LIMIT:
        return "Limite d'API";
      case NotionErrorType.VALIDATION:
        return "Validation";
      case NotionErrorType.DATABASE:
        return "Base de données";
      default:
        return "Inconnue";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Erreurs Notion
          <Badge variant="destructive" className="ml-2">
            {errors.length}
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-8 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Réduire" : "Voir tout"}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-full max-h-[300px]">
          <div className="space-y-2">
            {(expanded ? errors : errors.slice(0, 3)).map((error, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded-md">
                <div className="flex items-start gap-2">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getSeverityColor(error.severity)}`}>
                        {getErrorTypeName(error.type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">{error.message}</p>
                    {error.context && (
                      <p className="text-xs text-gray-500 mt-1">
                        Contexte: {JSON.stringify(error.context)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {!expanded && errors.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setExpanded(true)}
              >
                Voir {errors.length - 3} erreurs supplémentaires
              </Button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearErrors}
          className="w-full gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Effacer toutes les erreurs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionErrorMonitor;
