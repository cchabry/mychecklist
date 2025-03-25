
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { corsProxy } from '@/services/corsProxy';
import { toast } from 'sonner';

/**
 * Page de diagnostics pour le système de proxy CORS
 */
const CorsProxyDiagnostics: React.FC = () => {
  const [isTestingProxies, setIsTestingProxies] = useState(false);
  const [proxyResults, setProxyResults] = useState<Record<string, boolean>>({});
  const currentProxy = corsProxy.getCurrentProxy();
  const availableProxies = corsProxy.getAvailableProxies();

  // Test tous les proxies CORS disponibles
  const testAllProxies = async () => {
    setIsTestingProxies(true);
    const results: Record<string, boolean> = {};
    
    // Utiliser un token fictif pour le test
    const testToken = "Bearer test_token_for_proxy";
    
    try {
      for (const proxy of availableProxies) {
        try {
          const result = await corsProxy.testProxy(proxy, testToken);
          results[proxy.name] = result.success;
          
          if (result.success) {
            console.log(`✅ Proxy ${proxy.name} fonctionne`);
          } else {
            console.log(`❌ Proxy ${proxy.name} ne fonctionne pas:`, result.error || result.statusCode);
          }
        } catch (error) {
          results[proxy.name] = false;
          console.error(`Erreur lors du test de ${proxy.name}:`, error);
        }
      }
      
      setProxyResults(results);
      
      // Trouver un proxy qui fonctionne
      const workingProxy = Object.entries(results).find(([_, success]) => success);
      if (workingProxy) {
        toast.success(`Proxy fonctionnel trouvé: ${workingProxy[0]}`);
      } else {
        toast.error("Aucun proxy CORS ne fonctionne");
      }
    } finally {
      setIsTestingProxies(false);
    }
  };

  // Réinitialiser le cache des proxies
  const resetProxyCache = () => {
    corsProxy.resetProxyCache();
    toast.success("Cache des proxies réinitialisé");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics du proxy CORS</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>État du proxy CORS</CardTitle>
            <CardDescription>Informations sur le proxy CORS actuel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Proxy actuel:</p>
              {currentProxy ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {currentProxy.name} ({currentProxy.url})
                </Badge>
              ) : (
                <Badge variant="destructive">Aucun proxy sélectionné</Badge>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Proxies disponibles:</p>
              <div className="space-y-2">
                {availableProxies.map(proxy => (
                  <div key={proxy.name} className="flex items-center justify-between">
                    <span className="text-sm">{proxy.name}</span>
                    {proxyResults[proxy.name] !== undefined && (
                      <Badge variant={proxyResults[proxy.name] ? "success" : "destructive"}>
                        {proxyResults[proxy.name] ? "Fonctionnel" : "Non fonctionnel"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={testAllProxies}
              disabled={isTestingProxies}
            >
              {isTestingProxies ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Test en cours...</>
              ) : (
                <>Tester tous les proxies</>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetProxyCache}
            >
              Réinitialiser le cache
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Guide de configuration</CardTitle>
            <CardDescription>
              Instructions pour configurer manuellement un proxy CORS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Utilisation des proxies CORS</AlertTitle>
              <AlertDescription>
                Le proxy CORS n'est nécessaire que lorsque les fonctions serverless
                ne sont pas disponibles. Sur Netlify/Vercel, utilisez plutôt les fonctions 
                serverless pour une meilleure sécurité et performance.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Proxies qui nécessitent une activation:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {availableProxies
                  .filter(proxy => proxy.requiresActivation)
                  .map(proxy => (
                    <li key={proxy.name} className="text-sm">
                      {proxy.name} 
                      {proxy.activationUrl && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="inline-flex items-center h-auto p-0 ml-2" 
                          asChild
                        >
                          <a href={proxy.activationUrl} target="_blank" rel="noopener noreferrer">
                            Activer <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {proxy.instructions && (
                        <p className="text-xs text-muted-foreground ml-5">{proxy.instructions}</p>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CorsProxyDiagnostics;
