
import React from 'react';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getDeploymentType } from '@/lib/notionProxy/config';

interface ProxyStatusIndicatorProps {
  isDemoMode: boolean;
}

const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({ isDemoMode }) => {
  const deploymentType = getDeploymentType();

  // Afficher différents statuts selon l'environnement et le mode
  if (isDemoMode) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Mode démonstration actif</AlertTitle>
        <AlertDescription className="text-green-600 text-sm">
          Vous utilisez l'application en mode démo. Aucune connexion à l'API Notion n'est nécessaire.
        </AlertDescription>
      </Alert>
    );
  }

  if (deploymentType === 'netlify') {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Déploiement Netlify</AlertTitle>
        <AlertDescription className="text-blue-600 text-sm">
          Les fonctions serverless Netlify sont utilisées pour contourner les limitations CORS.
        </AlertDescription>
      </Alert>
    );
  }

  if (deploymentType === 'lovable') {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">Aperçu Lovable</AlertTitle>
        <AlertDescription className="text-amber-600 text-sm">
          L'aperçu Lovable utilise un proxy CORS côté client. Pour une solution plus fiable, déployez sur Netlify.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-gray-50 border-gray-200">
      <WifiOff className="h-4 w-4 text-gray-600" />
      <AlertTitle className="text-gray-700">Environnement {deploymentType}</AlertTitle>
      <AlertDescription className="text-gray-600 text-sm">
        Le système adapte automatiquement la méthode de connexion à l'API Notion.
      </AlertDescription>
    </Alert>
  );
};

export default ProxyStatusIndicator;
