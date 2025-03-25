
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, ToggleLeft, ToggleRight, Activity, RefreshCw } from "lucide-react";
import { useOperationMode } from '@/lib/operationMode';
import { OperationMode } from '@/services/operationMode/types';
import OperationModeSettings from '@/components/OperationModeSettings';

/**
 * Page de diagnostics pour le système operationMode
 */
const OperationModeDiagnostics: React.FC = () => {
  const {
    currentMode,
    switchReason,
    connectionHealth,
    settings,
    isDemoMode,
    isRealMode,
    enableDemoMode,
    enableRealMode,
    toggleMode,
    handleConnectionError,
    reset
  } = useOperationMode();

  const [isSimulatingError, setIsSimulatingError] = useState(false);

  const simulateError = () => {
    setIsSimulatingError(true);
    
    try {
      const error = new Error("Erreur simulée pour tester le système operationMode");
      handleConnectionError(error, "Test de diagnostic");
    } finally {
      setIsSimulatingError(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics du Mode Opérationnel</h1>
      
      <Alert className={`mb-6 ${isDemoMode ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
        <Info className="h-4 w-4" />
        <AlertTitle>
          {isDemoMode ? 'Mode Démo activé' : 'Mode Réel activé'}
        </AlertTitle>
        <AlertDescription>
          {isDemoMode 
            ? `Le mode démo est actuellement activé. Raison: ${switchReason || 'Non spécifiée'}`
            : 'Le mode réel est actuellement activé. L\'application utilise l\'API Notion.'}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>État du mode opérationnel</CardTitle>
            <CardDescription>Informations sur le mode opérationnel actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Mode actuel:</span>
                <Badge variant={isDemoMode ? "outline" : "default"} className={isDemoMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}>
                  {currentMode === OperationMode.DEMO ? 'Mode Démo' : 'Mode Réel'}
                </Badge>
              </div>
              
              {switchReason && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Raison du changement:</span>
                  <span className="text-gray-600">{switchReason}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Échecs consécutifs:</span>
                <Badge variant={connectionHealth.consecutiveErrors > 0 ? "destructive" : "outline"} className={connectionHealth.consecutiveErrors > 0 ? 'bg-red-50 text-red-700' : ''}>
                  {connectionHealth.consecutiveErrors}
                </Badge>
              </div>
              
              {connectionHealth.lastError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="font-semibold text-red-700">Dernière erreur:</p>
                  <p className="text-red-600 text-sm mt-1">{connectionHealth.lastError.message}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`gap-2 ${isDemoMode ? 'bg-amber-50 text-amber-700' : ''}`}
                  onClick={() => enableDemoMode('Test manuel depuis diagnostics')}
                >
                  <ToggleLeft className="h-4 w-4" />
                  Activer Mode Démo
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`gap-2 ${isRealMode ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={enableRealMode}
                >
                  <ToggleRight className="h-4 w-4" />
                  Activer Mode Réel
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={toggleMode}
                >
                  <RefreshCw className="h-4 w-4" />
                  Basculer le mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tests de diagnostic</CardTitle>
            <CardDescription>Tester le comportement du système operationMode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Ces outils permettent de simuler des erreurs et de tester la réponse du système operationMode
                face à différentes situations.
              </p>
              
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <h3 className="font-medium mb-2">Tester le basculement automatique</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Simule une erreur de connexion pour tester le système de basculement automatique.
                  Le système basculera en mode démo si le nombre d'échecs dépasse le seuil configuré.
                </p>
                <Button 
                  variant="outline"
                  onClick={simulateError}
                  disabled={isSimulatingError}
                  className="w-full justify-center"
                >
                  {isSimulatingError ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Simulation en cours...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Simuler une erreur de connexion
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <h3 className="font-medium mb-2">Réinitialiser l'état</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Réinitialise tous les compteurs d'erreurs et restaure les paramètres par défaut.
                </p>
                <Button 
                  variant="outline"
                  onClick={reset}
                  className="w-full justify-center"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Réinitialiser l'état
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Paramètres du mode opérationnel</CardTitle>
          <CardDescription>Configurez le comportement du système operationMode</CardDescription>
        </CardHeader>
        <CardContent>
          <OperationModeSettings />
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationModeDiagnostics;
