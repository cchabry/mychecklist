
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CacheSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CacheSearch: React.FC<CacheSearchProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="mb-4 relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Rechercher par clé..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};

export default CacheSearch;
