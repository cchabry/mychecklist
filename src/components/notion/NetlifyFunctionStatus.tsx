
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

/**
 * Composant affichant le statut des fonctions Netlify
 */
const NetlifyFunctionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [isChecking, setIsChecking] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Utiliser une référence pour suivre si le composant est monté
  const isMounted = useRef(true);
  // Référence pour éviter les vérifications supplémentaires pendant le chargement initial
  const initialCheckComplete = useRef(false);
  
  // Nettoyer quand le composant est démonté
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  
  const checkFunctionStatus = async () => {
    if (isChecking) return; // Éviter les vérifications simultanées
    
    setIsChecking(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      
      // Tester la fonction Netlify
      const response = await fetch('/.netlify/functions/notion-proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Vérifier si le composant est toujours monté avant de mettre à jour l'état
      if (!isMounted.current) return;
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fonction Netlify disponible:', data);
        setStatus('available');
      } else {
        console.error('Fonction Netlify non disponible, statut:', response.status);
        setError(`Statut HTTP: ${response.status}`);
        setStatus('unavailable');
      }
    } catch (err) {
      // Vérifier si le composant est toujours monté avant de mettre à jour l'état
      if (!isMounted.current) return;
      
      console.error('Erreur lors du test de la fonction Netlify:', err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus('unavailable');
    } finally {
      // Vérifier si le composant est toujours monté avant de mettre à jour l'état
      if (isMounted.current) {
        setIsChecking(false);
        initialCheckComplete.current = true;
      }
    }
  };
  
  // Vérifier le statut au chargement, une seule fois
  useEffect(() => {
    if (!initialCheckComplete.current) {
      checkFunctionStatus();
    }
  }, []);
  
  return (
    <Card className={status === 'available' ? 'border-green-200' : status === 'unavailable' ? 'border-red-200' : 'border-blue-200'}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'checking' || isChecking ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : status === 'available' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            
            <div>
              <h3 className="font-medium">Fonctions Netlify</h3>
              <p className="text-sm text-muted-foreground">
                {status === 'checking' || isChecking
                  ? 'Vérification des fonctions Netlify...'
                  : status === 'available'
                  ? `Fonctions disponibles (${responseTime}ms)`
                  : 'Fonctions non disponibles'}
              </p>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status === 'available' && (
              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                Disponible
              </Badge>
            )}
            
            {status === 'unavailable' && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                Non disponible
              </Badge>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkFunctionStatus}
              disabled={isChecking}
              className="ml-2 text-xs"
            >
              {isChecking && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
              Vérifier
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetlifyFunctionStatus;
