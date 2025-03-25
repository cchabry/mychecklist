
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProxyActionButtonsProps {
  checking: boolean;
  onCheckCurrentProxy: () => void;
  onFindBetterProxy: () => void;
  onResetProxies: () => void;
}

const ProxyActionButtons: React.FC<ProxyActionButtonsProps> = ({
  checking,
  onCheckCurrentProxy,
  onFindBetterProxy,
  onResetProxies
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCheckCurrentProxy}
        disabled={checking}
        className="text-xs"
      >
        {checking ? (
          <><RefreshCw size={14} className="mr-1 animate-spin" /> Test en cours...</>
        ) : (
          <><RefreshCw size={14} className="mr-1" /> Tester le proxy actuel</>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onFindBetterProxy}
        disabled={checking}
        className="text-xs"
      >
        {checking ? (
          <><RefreshCw size={14} className="mr-1 animate-spin" /> Recherche...</>
        ) : (
          <>Trouver le meilleur proxy</>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onResetProxies}
        disabled={checking}
        className="text-xs text-amber-600"
      >
        Réinitialiser
      </Button>
    </div>
  );
};

export default ProxyActionButtons;
