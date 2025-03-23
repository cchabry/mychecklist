
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface CacheFooterProps {
  entriesCount: number;
  onClearAll: () => void;
}

const CacheFooter: React.FC<CacheFooterProps> = ({ 
  entriesCount, 
  onClearAll 
}) => {
  return (
    <div className="flex justify-between">
      <div className="text-sm text-muted-foreground">
        {entriesCount} entrées dans le cache
      </div>
      
      {entriesCount > 0 && (
        <Button variant="destructive" size="sm" onClick={onClearAll}>
          <Trash className="h-4 w-4 mr-2" />
          Vider le cache
        </Button>
      )}
    </div>
  );
};

export default CacheFooter;
