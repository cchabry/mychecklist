
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, InfoIcon } from "lucide-react";
import { notionCentralService } from '@/services/notion/notionCentralService';

interface NotionConnectionTestsProps {
  onSuccess?: () => void;
}

/**
 * Composant de test de la connexion à l'API Notion
 * Utilise exclusivement le service centralisé
 */
const NotionConnectionTests: React.FC<NotionConnectionTestsProps> = ({ onSuccess }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    message: string;
    details?: string;
    user?: string;
  }>(null);

  // Tester la connexion à l'API Notion
  const testConnection = useCallback(async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('Test de connexion à Notion via le service centralisé');
      
      // Utiliser EXCLUSIVEMENT le service centralisé
      const response = await notionCentralService.testConnection();
      
      if (response.success) {
        setResult({
          success: true,
          message: 'Connexion à l\'API Notion réussie',
          user: response.user || 'Utilisateur Notion'
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setResult({
          success: false,
          message: 'Échec de la connexion à l\'API Notion',
          details: response.error || 'Erreur inconnue'
        });
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      
      setResult({
        success: false,
        message: 'Erreur lors du test de connexion',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setTesting(false);
    }
  }, [onSuccess]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Tester la connexion à l'API Notion
        </h3>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={testConnection}
          disabled={testing}
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : 'Tester la connexion'}
        </Button>
      </div>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <div>
              <AlertTitle>{result.message}</AlertTitle>
              {result.success ? (
                <AlertDescription>
                  Connecté en tant que: <strong>{result.user}</strong>
                </AlertDescription>
              ) : (
                <AlertDescription className="text-xs whitespace-pre-wrap">
                  {result.details}
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default NotionConnectionTests;
