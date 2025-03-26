
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FilterOption = {
  id: string;
  label: string;
  value: string;
  category?: string;
};

export type FilterBarProps = {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: FilterOption[]) => void;
  filterOptions?: FilterOption[];
  className?: string;
};

/**
 * Barre de filtres réutilisable
 */
export const FilterBar = ({
  placeholder = "Rechercher...",
  onSearch,
  onFilterChange,
  filterOptions = [],
  className,
}: FilterBarProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);

  const handleSearch = () => {
    onSearch?.(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFilter = (filter: FilterOption) => {
    const isSelected = selectedFilters.some(f => f.id === filter.id);
    let newFilters: FilterOption[];
    
    if (isSelected) {
      newFilters = selectedFilters.filter(f => f.id !== filter.id);
    } else {
      newFilters = [...selectedFilters, filter];
    }
    
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const removeFilter = (filterId: string) => {
    const newFilters = selectedFilters.filter(f => f.id !== filterId);
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    onFilterChange?.([]);
  };

  // Organiser les filtres par catégorie
  const filtersByCategory: Record<string, FilterOption[]> = {};
  filterOptions.forEach(filter => {
    const category = filter.category || 'Général';
    if (!filtersByCategory[category]) {
      filtersByCategory[category] = [];
    }
    filtersByCategory[category].push(filter);
  });

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="pr-8"
          />
          <Search 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
            onClick={handleSearch}
          />
        </div>
        <Button 
          variant={showFilters ? "secondary" : "outline"} 
          size="icon" 
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 border rounded-md bg-card shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Filtres</h3>
            {selectedFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs">
                Effacer tout
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {Object.entries(filtersByCategory).map(([category, filters]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.map(filter => (
                    <Badge
                      key={filter.id}
                      variant={selectedFilters.some(f => f.id === filter.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFilter(filter)}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map(filter => (
            <Badge key={filter.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(filter.id)}
                className="h-4 w-4 ml-1 hover:bg-secondary-foreground/10 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
