
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Globe } from 'lucide-react';

interface ProxyStatusIndicatorProps {
  isDemoMode: boolean;
}

const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({ isDemoMode }) => {
  // Si nous sommes en mode démo, ce composant n'est pas pertinent
  if (isDemoMode) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Mode démo actif</h3>
              <p className="text-xs text-amber-700 mt-1">
                Le mode démo est activé, le proxy CORS n'est pas utilisé.
                Désactivez le mode démo pour utiliser les fonctions Netlify.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Fonctions Netlify configurées
            </h3>
            <p className="text-xs text-green-700 mt-1">
              Les requêtes à l'API Notion passent par les fonctions serverless Netlify,
              ce qui évite les problèmes de CORS.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProxyStatusIndicator;
