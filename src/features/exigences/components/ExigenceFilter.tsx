/**
 * Composant de filtrage pour les exigences
 */

import React from 'react';
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
import { IMPORTANCE_LEVEL_MAPPING } from '../constants';
import { ExigenceFilters } from '../types';
import { cn } from '@/lib/utils';

interface ExigenceFilterProps {
  filters: ExigenceFilters;
  onFilterChange: (filters: ExigenceFilters) => void;
  categories: string[];
  subcategories: string[];
  className?: string;
}

/**
 * Composant de filtrage pour les exigences
 */
export function ExigenceFilter({
  filters,
  onFilterChange,
  categories,
  subcategories,
  className,
}: ExigenceFilterProps) {
  const updateFilter = (key: keyof ExigenceFilters, value: any) => {
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
    filters.importance || 
    filters.category || 
    filters.subcategory
  );
  
  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardContent className="p-0 space-y-4">
        <div className="flex gap-2 w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des exigences..."
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
                  <h4 className="font-medium">Niveau d'importance</h4>
                  <Select
                    value={filters.importance || ''}
                    onValueChange={(value) => updateFilter('importance', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les niveaux" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les niveaux</SelectItem>
                      {Object.entries(IMPORTANCE_LEVEL_MAPPING).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", value.color.split(' ')[0])} />
                            {value.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
