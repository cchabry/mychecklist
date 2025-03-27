
/**
 * Composant de filtrage pour les items de checklist
 */

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChecklistFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  effort?: string;
  priority?: string;
}

interface ChecklistFilterProps {
  filters: ChecklistFilters;
  onFilterChange: (filters: ChecklistFilters) => void;
  categories: string[];
  subcategories: string[];
  className?: string;
}

/**
 * Composant de filtrage pour les items de checklist
 */
export function ChecklistFilter({
  filters,
  onFilterChange,
  categories,
  subcategories,
  className,
}: ChecklistFilterProps) {
  const updateFilter = (key: keyof ChecklistFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };
  
  const resetFilters = () => {
    onFilterChange({
      search: filters.search // Conserver uniquement la recherche
    });
  };
  
  const hasActiveFilters = !!(
    filters.category || 
    filters.subcategory ||
    filters.effort ||
    filters.priority
  );
  
  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardContent className="p-0 space-y-4">
        <div className="flex gap-2 w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des critères..."
              className="pl-9"
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Catégorie</h4>
                  <Select
                    value={filters.category || ''}
                    onValueChange={(value) => updateFilter('category', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Sous-catégorie</h4>
                  <Select
                    value={filters.subcategory || ''}
                    onValueChange={(value) => updateFilter('subcategory', value || undefined)}
                    disabled={!filters.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les sous-catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les sous-catégories</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Priorité</h4>
                  <Select
                    value={filters.priority || ''}
                    onValueChange={(value) => updateFilter('priority', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les priorités</SelectItem>
                      <SelectItem value="HAUTE">Haute</SelectItem>
                      <SelectItem value="MOYENNE">Moyenne</SelectItem>
                      <SelectItem value="BASSE">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Niveau d'effort</h4>
                  <Select
                    value={filters.effort || ''}
                    onValueChange={(value) => updateFilter('effort', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les niveaux d'effort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les niveaux d'effort</SelectItem>
                      <SelectItem value="ÉLEVÉ">Élevé</SelectItem>
                      <SelectItem value="MOYEN">Moyen</SelectItem>
                      <SelectItem value="FAIBLE">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
