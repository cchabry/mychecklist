
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { useNotionErrorService } from '@/hooks/notion/useNotionErrorService';
import { NotionError } from '@/services/notion/errorHandling/types';
import NotionErrorDetails from './NotionErrorDetails';

const NotionErrorMonitor: React.FC = () => {
  const { errors, clearErrors } = useNotionErrorService();
  const [selectedError, setSelectedError] = useState<NotionError | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Rafraîchir la liste des erreurs
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Configurer un intervalle de rafraîchissement
    const interval = setInterval(handleRefresh, 5000);
    return () => clearInterval(interval);
  }, []);

  // Afficher les détails d'une erreur
  const handleViewDetails = (error: NotionError) => {
    setSelectedError(error);
  };

  // Fermer les détails
  const handleCloseDetails = () => {
    setSelectedError(null);
  };

  // Effacer toutes les erreurs
  const handleClearErrors = () => {
    clearErrors();
    setSelectedError(null);
  };

  // Adapter la couleur en fonction de la gravité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'error': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Erreurs Notion
              </CardTitle>
              <CardDescription>
                {errors.length === 0
                  ? "Aucune erreur récente avec l'API Notion"
                  : `${errors.length} erreur(s) récente(s) avec l'API Notion`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-8 px-2"
              >
                <RefreshCw size={16} />
              </Button>
              {errors.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearErrors}
                  className="h-8 px-2"
                >
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-2">Aucune erreur à afficher</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-md border cursor-pointer hover:border-muted-foreground/40"
                  onClick={() => handleViewDetails(error)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(error.severity)}`}>
                        {error.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm truncate">{error.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedError && (
        <NotionErrorDetails
          isOpen={!!selectedError}
          onClose={handleCloseDetails}
          error={selectedError.message}
          context={selectedError.context ? JSON.stringify(selectedError.context) : undefined}
        />
      )}
    </>
  );
};

export default NotionErrorMonitor;
