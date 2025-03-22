
import React, { useState, useCallback } from 'react';
import { useCache, useStaleWhileRevalidate } from '@/hooks/useCache';
import { cacheManager } from '@/services/cache/cacheManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import CacheManagerComponent from '@/components/cache/CacheManager';
import { RefreshCw, Clock, Trash2 } from 'lucide-react';

/**
 * Composant pour tester le système de cache
 */
const CacheDiagnostics: React.FC = () => {
  const [counter, setCounter] = useState(0);
  
  // Définir une fonction de récupération qui simule un appel API
  const fetchData = useCallback(async () => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      timestamp: new Date().toISOString(),
      random: Math.random(),
      counter: counter
    };
  }, [counter]);
  
  // Utiliser notre hook useCache
  const { 
    data: normalCacheData, 
    isLoading: normalCacheLoading,
    isStale: normalCacheStale,
    refetch: normalCacheRefetch
  } = useCache('test-cache-key', fetchData, { ttl: 10000 });
  
  // Utiliser notre hook useStaleWhileRevalidate
  const { 
    data: staleData, 
    isLoading: staleLoading,
    isStale: isStaleData,
    refetch: staleRefetch
  } = useStaleWhileRevalidate('test-stale-key', fetchData, { ttl: 5000 });
  
  // Incrémenter le compteur et invalider le cache
  const handleIncrement = () => {
    setCounter(prev => prev + 1);
    cacheManager.invalidate('test-cache-key');
    cacheManager.invalidate('test-stale-key');
    toast.info('Cache invalidé');
  };
  
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Diagnostics du cache</h1>
        <p className="text-muted-foreground">
          Testez les différentes fonctionnalités du système de cache
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cache standard</CardTitle>
            <CardDescription>
              Mise en cache simple avec durée de vie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">État:</h3>
                <div className="flex gap-2">
                  <Badge variant={normalCacheLoading ? "secondary" : "outline"}>
                    {normalCacheLoading ? "Chargement..." : "Prêt"}
                  </Badge>
                  
                  {normalCacheStale && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Périmé
                    </Badge>
                  )}
                </div>
              </div>
              
              {normalCacheData && (
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(normalCacheData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => normalCacheRefetch()}
              disabled={normalCacheLoading}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => cacheManager.invalidate('test-cache-key')}
              className="mr-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Invalider
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cache avec stratégie stale-while-revalidate</CardTitle>
            <CardDescription>
              Retourne les données périmées pendant le rafraîchissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">État:</h3>
                <div className="flex gap-2">
                  <Badge variant={staleLoading ? "secondary" : "outline"}>
                    {staleLoading ? "Chargement..." : "Prêt"}
                  </Badge>
                  
                  {isStaleData && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Revalidation en cours
                    </Badge>
                  )}
                </div>
              </div>
              
              {staleData && (
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(staleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => staleRefetch()}
              disabled={staleLoading}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => cacheManager.invalidate('test-stale-key')}
              className="mr-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Invalider
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex justify-center my-8">
        <Button onClick={handleIncrement}>
          Incrémenter compteur et invalider le cache: {counter}
        </Button>
      </div>
      
      <Separator className="my-8" />
      
      <CacheManagerComponent />
    </div>
  );
};

export default CacheDiagnostics;
