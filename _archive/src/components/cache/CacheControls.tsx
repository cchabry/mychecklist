
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';

interface CacheControlsProps {
  onRefresh: () => void;
  onCleanExpired: () => void;
}

const CacheControls: React.FC<CacheControlsProps> = ({ 
  onRefresh, 
  onCleanExpired 
}) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualiser
      </Button>
      <Button variant="outline" size="sm" onClick={onCleanExpired}>
        <Clock className="h-4 w-4 mr-2" />
        Nettoyer expirés
      </Button>
    </div>
  );
};

export default CacheControls;
