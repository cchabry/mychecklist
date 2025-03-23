
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useOperationModeListener } from '@/hooks/useOperationModeListener';
import { operationMode } from '@/services/operationMode';

/**
 * Page de diagnostics pour le système operationMode
 */
const OperationModeDiagnostics: React.FC = () => {
  const { isDemoMode } = useOperationModeListener();
  const [lastAction, setLastAction] = useState<string>('');
  
  const handleToggleMode = () => {
    if (isDemoMode) {
      operationMode.enableRealMode();
      setLastAction('Mode réel activé');
    } else {
      operationMode.enableDemoMode();
      setLastAction('Mode démo activé');
    }
  };
  
  const simulateConnectionError = () => {
    operationMode.handleConnectionError(
      new Error('Erreur de connexion simulée'),
      'Test de diagnostic'
    );
    setLastAction('Erreur de connexion simulée');
  };
  
  const simulateSuccessfulOperation = () => {
    operationMode.handleSuccessfulOperation();
    setLastAction('Opération réussie simulée');
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics du Mode Opérationnel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>État du Mode Opérationnel</CardTitle>
            <CardDescription>Mode actuel de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mode actuel:</p>
                {isDemoMode ? (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Mode Démo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Mode Réel
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Démo</span>
                <Switch checked={!isDemoMode} onCheckedChange={handleToggleMode} />
                <span className="text-sm">Réel</span>
              </div>
            </div>
            {lastAction && (
              <p className="text-sm mt-4 p-2 bg-gray-50 rounded-md">
                Dernière action: {lastAction}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tests de fonctionnalité</CardTitle>
            <CardDescription>Simulez différents événements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button variant="outline" onClick={simulateConnectionError} className="w-full">
                  Simuler une erreur de connexion
                </Button>
              </div>
              <div>
                <Button variant="outline" onClick={simulateSuccessfulOperation} className="w-full">
                  Simuler une opération réussie
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OperationModeDiagnostics;
