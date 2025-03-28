
// Note: React est automatiquement importé par le compilateur JSX, pas besoin de l'importer explicitement
import { useOperationMode } from '@/hooks/useOperationMode';
import { Badge } from '@/components/ui/badge';

/**
 * Indicateur visuel du mode d'opération courant (demo/real)
 * 
 * Ce composant affiche un badge indiquant si l'application fonctionne en mode réel
 * (avec l'API Notion) ou en mode démo (avec des données simulées).
 */
export function OperationModeIndicator() {
  const { mode, isRealMode } = useOperationMode();
  
  if (isRealMode) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        Mode Réel
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="border-amber-500 text-amber-600">
      Mode Démo
    </Badge>
  );
}

export default OperationModeIndicator;
