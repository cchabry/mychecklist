
import { List } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExigenceSortOption } from '../types';

interface ExigenceSortBarProps {
  isLoading: boolean;
  sortOption: ExigenceSortOption;
  onSortChange: (value: ExigenceSortOption) => void;
  totalCount: number;
  filteredCount: number;
}

/**
 * Barre de tri et d'informations pour les exigences
 */
export function ExigenceSortBar({ 
  isLoading, 
  sortOption, 
  onSortChange,
  totalCount,
  filteredCount
}: ExigenceSortBarProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Select
          value={sortOption}
          onValueChange={(value) => onSortChange(value as ExigenceSortOption)}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="importance_desc">Importance (haute → basse)</SelectItem>
            <SelectItem value="importance_asc">Importance (basse → haute)</SelectItem>
            <SelectItem value="category_asc">Catégorie (A-Z)</SelectItem>
            <SelectItem value="category_desc">Catégorie (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <List className="h-4 w-4" />
        <span>
          {isLoading 
            ? 'Chargement des exigences...' 
            : `${filteredCount} exigences sur ${totalCount} au total`
          }
        </span>
      </div>
    </div>
  );
}

export default ExigenceSortBar;
