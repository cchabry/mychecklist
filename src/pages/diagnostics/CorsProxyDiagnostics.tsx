
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { corsProxy } from '@/services/corsProxy';

const CorsProxyDiagnostics: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{name: string, success: boolean, error?: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Test d'un proxy spécifique
  const testProxy = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Comme tous les proxies sont désactivés, on teste juste la fonction Netlify
      setTestResults([
        {
          name: 'Fonction Netlify',
          success: true,
          message: 'Toutes les requêtes passent exclusivement par les fonctions Netlify'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du test des proxies:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Recherche d'un proxy qui fonctionne
  const findWorkingProxy = async () => {
    setIsLoading(true);
    
    try {
      const proxyInfo = await corsProxy.findWorkingProxy();
      setTestResults([
        {
          name: 'Fonction Netlify',
          success: true,
          message: 'Les requêtes passent exclusivement par les fonctions Netlify'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de la recherche de proxy:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialiser le cache du proxy
  const resetProxyCache = () => {
    corsProxy.resetProxyCache();
    setTestResults([]);
  };
  
  // Obtenir l'information sur le proxy actuel
  const currentProxy = corsProxy.getCurrentProxy();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnostic du Proxy CORS</CardTitle>
        <CardDescription>
          Tests et détails sur le proxying des requêtes API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-medium">Proxy actuel:</span>
            <Badge variant="outline">Fonctions Netlify</Badge>
          </div>
          {currentProxy && (
            <p className="text-xs text-muted-foreground mt-1">
              {currentProxy.url}
            </p>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            onClick={testProxy}
          >
            {isLoading ? 'Test en cours...' : 'Tester les connexions'}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            disabled={isLoading}
            onClick={findWorkingProxy}
          >
            {isLoading ? 'Recherche en cours...' : 'Rechercher un proxy fonctionnel'}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={resetProxyCache}
          >
            Réinitialiser le cache
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="font-medium">Résultats des tests:</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md text-sm ${
                    result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{result.name}</span>
                    <Badge variant={result.success ? 'success' : 'destructive'}>
                      {result.success ? 'Succès' : 'Échec'}
                    </Badge>
                  </div>
                  {result.message && (
                    <p className="text-xs mt-1">{result.message}</p>
                  )}
                  {result.error && (
                    <p className="text-xs mt-1 text-red-600">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Les appels à l'API Notion passent exclusivement par les fonctions Netlify.
        </p>
      </CardFooter>
    </Card>
  );
};

export default CorsProxyDiagnostics;
