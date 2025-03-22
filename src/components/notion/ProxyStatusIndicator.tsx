
import React from 'react';
import { Wifi, WifiOff, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { operationMode } from '@/services/operationMode';

interface ProxyStatusIndicatorProps {
  isDemoMode?: boolean;
}

/**
 * Composant qui affiche l'état du proxy CORS et du mode démo
 */
const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({
  isDemoMode: propsDemoMode
}) => {
  // Utiliser le nouveau système operationMode comme source de vérité,
  // avec fallback sur les props pour la rétrocompatibilité
  const [proxyStatus, setProxyStatus] = React.useState<'unknown' | 'working' | 'not-working'>('unknown');
  const isDemoActive = propsDemoMode !== undefined ? propsDemoMode : operationMode.isDemoMode;
  
  React.useEffect(() => {
    // Nous n'avons pas besoin de tester le proxy si on est en mode démo
    if (isDemoActive) {
      setProxyStatus('unknown');
      return;
    }
    
    // Récupérer l'état du proxy depuis le localStorage ou autre source
    const storedStatus = localStorage.getItem('proxy_status');
    if (storedStatus === 'working') {
      setProxyStatus('working');
    } else if (storedStatus === 'not-working') {
      setProxyStatus('not-working');
    } else {
      setProxyStatus('unknown');
    }
  }, [isDemoActive]);
  
  if (isDemoActive) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Mode démonstration actif</AlertTitle>
        <AlertDescription className="text-blue-600">
          L'application utilise des données simulées. Aucune connexion à Notion n'est nécessaire.
          <span className="block mt-1 text-xs">Vous pouvez désactiver ce mode dans les paramètres.</span>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (proxyStatus === 'working') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Proxy CORS fonctionnel</AlertTitle>
        <AlertDescription className="text-green-600">
          La connexion à l'API Notion via le proxy CORS fonctionne correctement.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (proxyStatus === 'not-working') {
    return (
      <Alert className="bg-red-50 border-red-200">
        <WifiOff className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-700">Problème de connexion</AlertTitle>
        <AlertDescription className="text-red-600">
          Le proxy CORS ne fonctionne pas correctement. Essayez d'en choisir un autre.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default ProxyStatusIndicator;
