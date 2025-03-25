
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, RotateCcw } from 'lucide-react';

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
        <RefreshCw size={14} className={`mr-1 ${checking ? 'animate-spin' : ''}`} />
        {checking ? 'Test en cours...' : 'Vérifier le proxy'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onFindBetterProxy}
        disabled={checking}
        className="text-xs"
      >
        <Search size={14} className="mr-1" />
        Chercher un meilleur proxy
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onResetProxies}
        className="text-xs"
      >
        <RotateCcw size={14} className="mr-1" />
        Réinitialiser
      </Button>
    </div>
  );
};

export default ProxyActionButtons;
