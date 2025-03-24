
import React from 'react';
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useOperationMode } from '@/services/operationMode';

interface ResetButtonProps {
  className?: string;
}

/**
 * Bouton pour réinitialiser l'état du mode opérationnel
 */
const ResetButton: React.FC<ResetButtonProps> = ({ className = "" }) => {
  const { reset } = useOperationMode();

  return (
    <div className={`p-3 bg-gray-50 border border-gray-200 rounded-md ${className}`}>
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
  );
};

export default ResetButton;
