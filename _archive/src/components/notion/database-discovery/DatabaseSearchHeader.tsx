
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DatabaseSearchHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const DatabaseSearchHeader: React.FC<DatabaseSearchHeaderProps> = ({ 
  search, 
  onSearchChange, 
  onRefresh 
}) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Input
        placeholder="Rechercher une base de données..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Button
        variant="outline"
        onClick={onRefresh}
        className="shrink-0"
        size="sm"
      >
        Rafraîchir
      </Button>
    </div>
  );
};

export default DatabaseSearchHeader;
