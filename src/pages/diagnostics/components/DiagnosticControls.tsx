
import React from 'react';
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { useOperationMode } from '@/services/operationMode';

interface DiagnosticControlsProps {
  className?: string;
}

/**
 * Contrôles pour les diagnostics du mode opérationnel
 */
const DiagnosticControls: React.FC<DiagnosticControlsProps> = ({ className = "" }) => {
  const { isDemoMode, isRealMode, enableDemoMode, enableRealMode, toggle } = useOperationMode();
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
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
        onClick={toggle}
      >
        <RefreshCw className="h-4 w-4" />
        Basculer le mode
      </Button>
    </div>
  );
};

export default DiagnosticControls;
