
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NetlifyFunctionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Fonction pour tester la disponibilité des fonctions Netlify
  const checkNetlifyFunctions = async () => {
    setStatus('checking');
    setErrorMessage('');

    try {
      // Tester la fonction Netlify avec une requête simple (ping)
      const response = await fetch('/.netlify/functions/notion-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ping: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('La fonction Netlify est disponible mais a retourné une erreur');
        }
      } else {
        setStatus('error');
        setErrorMessage(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors du test des fonctions Netlify:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }

    setLastChecked(new Date());
  };

  // Vérifier au chargement
  useEffect(() => {
    checkNetlifyFunctions();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Fonctions Netlify</h3>
            {status === 'checking' && <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkNetlifyFunctions}
            disabled={status === 'checking'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${status === 'checking' ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
        </div>

        {status === 'success' && (
          <div className="text-green-600 bg-green-50 p-3 rounded-md">
            Les fonctions Netlify sont opérationnelles et peuvent communiquer avec l'API Notion
          </div>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Problème de connexion aux fonctions Netlify</AlertTitle>
            <AlertDescription>
              <p className="mt-1">{errorMessage}</p>
              <p className="mt-3 text-sm">
                Vérifiez que les fonctions Netlify sont correctement déployées et que votre connexion internet fonctionne.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {lastChecked && (
          <p className="text-xs text-muted-foreground mt-3">
            Dernière vérification: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default NetlifyFunctionStatus;
