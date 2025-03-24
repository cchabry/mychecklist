
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useOperationMode } from '@/services/operationMode';
import { OperationMode } from '@/services/operationMode/types';
import OperationModeSettings from '@/components/OperationModeSettings';
import { DiagnosticCard, StatusDisplay, DiagnosticControls, ErrorSimulator, ResetButton } from './components';

/**
 * Page de diagnostics pour le système operationMode
 */
const OperationModeDiagnostics: React.FC = () => {
  const { isDemoMode, switchReason, lastError } = useOperationMode();

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
        <DiagnosticCard 
          title="État du mode opérationnel" 
          description="Informations sur le mode opérationnel actuel"
        >
          <StatusDisplay />
          
          {lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="font-semibold text-red-700">Dernière erreur:</p>
              <p className="text-red-600 text-sm mt-1">{lastError.message}</p>
            </div>
          )}
          
          <DiagnosticControls className="mt-4" />
        </DiagnosticCard>
        
        <DiagnosticCard
          title="Tests de diagnostic"
          description="Tester le comportement du système operationMode"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Ces outils permettent de simuler des erreurs et de tester la réponse du système operationMode
              face à différentes situations.
            </p>
            
            <ErrorSimulator />
            
            <ResetButton />
          </div>
        </DiagnosticCard>
      </div>
      
      <DiagnosticCard 
        className="mb-6"
        title="Paramètres du mode opérationnel"
        description="Configurez le comportement du système operationMode"
      >
        <OperationModeSettings />
      </DiagnosticCard>
    </div>
  );
};

export default OperationModeDiagnostics;
