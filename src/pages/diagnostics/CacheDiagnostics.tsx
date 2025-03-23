
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCache } from '@/hooks/cache/useCache';
import { useStaleWhileRevalidate } from '@/hooks/cache/useStaleWhileRevalidate';

const testData = {
  timestamp: new Date().toISOString(),
  random: Math.random(),
  counter: 0
};

const CacheDiagnostics: React.FC = () => {
  const cache = useCache();
  const [counter, setCounter] = useState(0);

  // Fetch function pour le hook StaleWhileRevalidate
  const fetchTestData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de latence
    return {
      timestamp: new Date().toISOString(),
      random: Math.random(),
      counter: counter
    };
  };

  // Utiliser le hook staleWhileRevalidate
  const {
    data,
    isLoading,
    isStale,
    error,
    refetch
  } = useStaleWhileRevalidate('cache-diagnostics', fetchTestData, { 
    ttl: 5000,
    staleTime: 3000
  });

  const incrementCounter = () => {
    setCounter(prev => prev + 1);
  };
  
  const handleRefetch = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostics du Cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleRefetch} disabled={isLoading}>
                {isLoading ? 'Chargement...' : 'Recharger les données'}
              </Button>
              <Button onClick={incrementCounter} variant="outline">
                Incrémenter ({counter})
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-md">
              <h3 className="font-semibold mb-2">État du cache</h3>
              <p><span className="font-medium">Chargement:</span> {isLoading ? 'Oui' : 'Non'}</p>
              <p><span className="font-medium">Données périmées:</span> {isStale ? 'Oui' : 'Non'}</p>
              <p><span className="font-medium">Erreur:</span> {error ? error.message : 'Aucune'}</p>
            </div>

            {data && (
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">Données</h3>
                <p><span className="font-medium">Timestamp:</span> {data.timestamp}</p>
                <p><span className="font-medium">Nombre aléatoire:</span> {data.random}</p>
                <p><span className="font-medium">Compteur:</span> {data.counter}</p>
              </div>
            )}

            <div className="p-4 bg-amber-50 rounded-md">
              <h3 className="font-semibold mb-2">Info</h3>
              <p className="text-sm">
                Ce composant utilise le hook <code>useStaleWhileRevalidate</code> qui affiche les données du cache
                même si elles sont périmées pendant qu'il recharge les données fraîches en arrière-plan.
              </p>
              <p className="text-sm mt-2">
                Les données sont considérées "périmées" après 3 secondes et expirées après 5 secondes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheDiagnostics;
