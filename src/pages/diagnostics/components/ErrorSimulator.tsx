
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useOperationMode } from '@/services/operationMode';

interface ErrorSimulatorProps {
  className?: string;
}

/**
 * Composant permettant de simuler des erreurs pour tester le système
 */
const ErrorSimulator: React.FC<ErrorSimulatorProps> = ({ className = "" }) => {
  const { handleConnectionError } = useOperationMode();
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
    <div className={`p-3 bg-gray-50 border border-gray-200 rounded-md ${className}`}>
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
  );
};

export default ErrorSimulator;
