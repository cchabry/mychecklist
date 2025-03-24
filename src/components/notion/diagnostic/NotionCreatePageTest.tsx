
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { notionApiRequest } from '@/lib/notionProxy/proxyFetch';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, ArrowRight, Loader2 } from 'lucide-react';
import NotionTestResult from './NotionTestResult';
import { consolidatedMockData } from '@/lib/mockData';
import { operationMode } from '@/services/operationMode';

interface NotionCreatePageTestProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  smallVariant?: boolean;
}

/**
 * Test de création d'une page Notion
 */
const NotionCreatePageTest: React.FC<NotionCreatePageTestProps> = ({
  onSuccess,
  onError,
  smallVariant = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'success' | 'error' | 'idle';
    message?: string;
    error?: Error;
    pageId?: string;
    pageUrl?: string;
  }>({
    status: 'idle'
  });

  // Exécuter le test de création de page
  const runTest = async () => {
    setIsLoading(true);
    setResult({ status: 'idle' });

    try {
      // Si en mode démo, simuler une réponse réussie
      if (operationMode.isDemoMode) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPageId = `page_${Date.now()}`;
        const mockPageUrl = `https://notion.so/${mockPageId}`;
        
        setResult({
          status: 'success',
          message: "Page créée avec succès (mode démonstration)",
          pageId: mockPageId,
          pageUrl: mockPageUrl
        });
        
        if (onSuccess) onSuccess();
      } else {
        // En mode réel, effectuer l'appel à l'API Notion
        const response = await fetch('/api/notion-test/create-page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `Test Page - ${new Date().toISOString()}`,
            content: "Cette page a été créée par un test automatisé."
          })
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        setResult({
          status: 'success',
          message: "Page créée avec succès",
          pageId: data.id,
          pageUrl: data.url
        });
        
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors du test de création de page:", error);
      const formattedError = error instanceof Error ? error : new Error(String(error));
      
      setResult({
        status: 'error',
        message: "Échec de la création de page",
        error: formattedError
      });
      
      if (onError) onError(formattedError);
    } finally {
      setIsLoading(false);
    }
  };

  // Version compacte pour l'UI "small"
  if (smallVariant) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={runTest} 
        disabled={isLoading}
        className={`min-w-[120px] ${
          result.status === 'success' ? 'border-green-500 text-green-600' : 
          result.status === 'error' ? 'border-red-500 text-red-600' : ''
        }`}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : result.status === 'success' ? (
          <Check className="mr-2 h-4 w-4" />
        ) : result.status === 'error' ? (
          <X className="mr-2 h-4 w-4" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        Créer Page
      </Button>
    );
  }

  // Version complète
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Test de création de page
          </h3>
          <p className="text-xs text-gray-500">Vérifie les permissions d'écriture</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={runTest}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              {result.status === 'success' ? (
                <Check className="mr-2 h-4 w-4" />
              ) : result.status === 'error' ? (
                <ArrowRight className="mr-2 h-4 w-4" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Lancer le test
            </>
          )}
        </Button>
      </div>
      
      {result.status !== 'idle' && (
        <NotionTestResult 
          status={result.status}
          title={result.status === 'success' ? "Page créée avec succès" : "Échec de la création de page"}
          message={result.message}
          error={result.error}
        >
          {result.status === 'success' && result.pageId && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ID: {result.pageId}
              </Badge>
              {result.pageUrl && (
                <a 
                  href={result.pageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline ml-2"
                >
                  Voir la page
                </a>
              )}
            </div>
          )}
        </NotionTestResult>
      )}
    </div>
  );
};

export default NotionCreatePageTest;
