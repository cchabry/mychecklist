
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Database, CloudOff } from 'lucide-react';
import { useOperationMode } from '@/services/operationMode';
import { toast } from 'sonner';

/**
 * Composant de contrôle du mode d'opération
 * Permet de basculer entre le mode réel et le mode démo
 */
const OperationModeControl: React.FC = () => {
  const { isDemoMode, toggle } = useOperationMode();
  const [isChanging, setIsChanging] = React.useState(false);
  
  // Gérer le changement de mode
  const handleModeChange = async () => {
    setIsChanging(true);
    
    try {
      // Attendre un peu pour montrer l'animation (simulation)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Basculer le mode
      toggle();
      
      // Message de toast spécifique au mode
      toast.success(
        isDemoMode ? 'Mode réel activé' : 'Mode démonstration activé',
        {
          description: isDemoMode 
            ? 'L\'application utilise maintenant l\'API Notion'
            : 'L\'application utilise maintenant des données simulées'
        }
      );
    } catch (error) {
      console.error('Erreur lors du changement de mode:', error);
      toast.error('Erreur de changement de mode', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsChanging(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 bg-background shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          {isDemoMode ? (
            <>
              <CloudOff className="h-4 w-4 text-amber-500" />
              <span>Mode démonstration</span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4 text-green-500" />
              <span>Mode réel (API Notion)</span>
            </>
          )}
        </h3>
        
        <Switch
          checked={!isDemoMode}
          onCheckedChange={handleModeChange}
          disabled={isChanging}
          className={isDemoMode ? "data-[state=unchecked]:bg-amber-200" : "data-[state=checked]:bg-green-500"}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        {isDemoMode 
          ? "L'application utilise des données de démonstration. Aucune connexion à l'API Notion n'est nécessaire."
          : "L'application utilise l'API Notion. Une connexion internet et une configuration API sont nécessaires."
        }
      </p>
      
      {isChanging && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Changement de mode en cours...</span>
        </div>
      )}
    </div>
  );
};

export default OperationModeControl;
