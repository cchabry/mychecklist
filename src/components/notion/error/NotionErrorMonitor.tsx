
import React, { useEffect, useState } from 'react';
import { useNotionErrorService, useRetryQueue } from '@/services/notion/errorHandling';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

interface NotionErrorMonitorProps {
  showPendingOperations?: boolean;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

/**
 * Composant flottant qui affiche les erreurs récentes et permet de les gérer
 */
const NotionErrorMonitor: React.FC<NotionErrorMonitorProps> = ({
  showPendingOperations = true,
  position = 'bottom-right'
}) => {
  const { errors } = useNotionErrorService();
  const { pendingCount, isProcessing, processQueue } = useRetryQueue();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Pas d'affichage si aucune erreur et pas d'opérations en attente
  if (errors.length === 0 && (!showPendingOperations || pendingCount === 0)) {
    return null;
  }
  
  // Déterminer la classe de position
  let positionClass = 'fixed';
  switch (position) {
    case 'top-right':
      positionClass += ' top-4 right-4';
      break;
    case 'top-left':
      positionClass += ' top-4 left-4';
      break;
    case 'bottom-left':
      positionClass += ' bottom-4 left-4';
      break;
    case 'bottom-right':
    default:
      positionClass += ' bottom-4 right-4';
      break;
  }
  
  return (
    <div className={`${positionClass} z-50`}>
      <div className="bg-white shadow-md rounded-lg border p-2">
        {isExpanded ? (
          <div className="space-y-2 w-72">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Moniteur d'erreurs</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setIsExpanded(false)}
              >
                ×
              </Button>
            </div>
            
            {errors.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-800">
                  {errors.length} erreur(s) récente(s)
                </h4>
                <ul className="text-xs mt-1 space-y-1">
                  {errors.slice(0, 3).map((error, index) => (
                    <li key={index} className="truncate">
                      {error.message}
                    </li>
                  ))}
                  {errors.length > 3 && (
                    <li className="text-muted-foreground">
                      + {errors.length - 3} autres...
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {showPendingOperations && pendingCount > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span>{pendingCount} opération(s) en attente</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => processQueue()}
                  disabled={isProcessing}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
                  Exécuter
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-xs h-7" 
            onClick={() => setIsExpanded(true)}
          >
            {errors.length > 0 ? (
              <AlertCircle className="h-3 w-3 text-red-500" />
            ) : (
              <Inbox className="h-3 w-3 text-blue-500" />
            )}
            {errors.length > 0 ? 
              `${errors.length} erreur(s)` : 
              `${pendingCount} en attente`}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotionErrorMonitor;
