
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import { OperationMode } from '@/services/operationMode/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Cloud, Database, TestTube, AlertCircle, RefreshCw } from 'lucide-react';
import { isNotionConfigured } from '@/lib/notion';

export const OperationModeControl: React.FC = () => {
  const { 
    mode, 
    isDemoMode, 
    enableDemoMode, 
    enableRealMode,
    failures,
    lastError,
    switchReason
  } = useOperationMode();
  
  const notionConfigured = isNotionConfigured();
  
  return (
    <div className={`rounded-md border p-3 ${isDemoMode ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <TestTube className="h-5 w-5 text-amber-600" />
          ) : (
            <Cloud className="h-5 w-5 text-green-600" />
          )}
          <div>
            <h3 className={`text-sm font-medium ${isDemoMode ? 'text-amber-800' : 'text-green-800'}`}>
              {isDemoMode ? 'Mode démonstration' : 'Mode réel (API Notion)'}
            </h3>
            {switchReason && (
              <p className={`text-xs ${isDemoMode ? 'text-amber-700' : 'text-green-700'}`}>
                {switchReason}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-xs ${isDemoMode ? 'text-amber-700' : 'text-green-700'}`}>
            {isDemoMode ? 'Démo' : 'API'}
          </span>
          <Switch
            checked={!isDemoMode}
            onCheckedChange={(checked) => {
              if (checked) {
                enableRealMode();
              } else {
                enableDemoMode("Changement manuel");
              }
            }}
            className={isDemoMode 
              ? "bg-amber-300 data-[state=checked]:bg-green-500" 
              : "bg-green-300 data-[state=checked]:bg-green-500"
            }
            disabled={!notionConfigured && !isDemoMode}
          />
          
          {lastError && (
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs ${isDemoMode ? 'border-amber-300 text-amber-800' : 'border-green-300 text-green-800'}`}
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Recharger
            </Button>
          )}
        </div>
      </div>
      
      {lastError && (
        <div className={`mt-2 text-xs rounded-md p-2 ${isDemoMode ? 'bg-amber-100' : 'bg-green-100'}`}>
          <div className="flex items-start gap-1.5">
            <AlertCircle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${isDemoMode ? 'text-amber-800' : 'text-green-800'}`} />
            <div>
              <p className="font-medium">Dernière erreur: {failures} échec(s)</p>
              <p className="break-all">{lastError.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {!notionConfigured && (
        <div className="mt-2 text-xs text-amber-800 bg-amber-100 rounded-md p-2">
          <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
          Notion n'est pas configuré. Certaines fonctionnalités ne sont disponibles qu'en mode démonstration.
        </div>
      )}
    </div>
  );
};
