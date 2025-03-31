
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { corsProxy } from '@/services/corsProxy';

interface ProxyStatusIndicatorProps {
  isDemoMode: boolean;
}

const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({ isDemoMode }) => {
  // Obtenir l'URL du proxy actuel s'il existe
  const currentProxy = corsProxy.getCurrentProxy();
  const hasProxy = !!currentProxy;
  
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
                Désactivez le mode démo pour utiliser le proxy CORS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={hasProxy ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {hasProxy ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Globe className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              {hasProxy ? "Proxy CORS configuré" : "Proxy CORS non configuré"}
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              {hasProxy 
                ? `Le proxy est configuré à l'adresse: ${currentProxy.url}`
                : "Aucun proxy CORS n'est configuré. Les appels directs à l'API Notion seront bloqués par le navigateur."}
            </p>
            {!hasProxy && (
              <p className="text-xs text-amber-700 mt-1">
                Pour utiliser l'API Notion, vous devez configurer un proxy CORS ou déployer l'application avec les fonctions serverless.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProxyStatusIndicator;
