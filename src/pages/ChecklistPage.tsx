
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { 
  useChecklistItems,
  ChecklistFilter,
  filterChecklistItems,
  sortChecklistItems,
  extractUniqueCategories,
  extractUniqueSubcategories,
  ChecklistSortOption
} from '@/features/checklist';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChecklistItemCard } from '@/components/checklist';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { List } from 'lucide-react';

// Page affichant la checklist complète
const ChecklistPage = () => {
  // État des filtres et du tri
  const [filters, setFilters] = useState<{ search: string; category?: string; subcategory?: string; priority?: string; effort?: string }>({ search: '' });
  const [sortOption, setSortOption] = useState<ChecklistSortOption>('consigne_asc');
  
  // Récupérer les items de checklist
  const { data: checklistItems = [], isLoading } = useChecklistItems();
  
  // Extraire les valeurs uniques pour les filtres
  const categories = useMemo(() => 
    extractUniqueCategories(checklistItems),
    [checklistItems]
  );
  
  const subcategories = useMemo(() => 
    extractUniqueSubcategories(checklistItems),
    [checklistItems]
  );
  
  // Filtrer et trier les items de checklist
  const filteredChecklistItems = useMemo(() => {
    let filtered = filterChecklistItems(checklistItems, filters);
    filtered = sortChecklistItems(filtered, sortOption);
    return filtered;
  }, [checklistItems, filters, sortOption]);

  // Gestionnaire de changement de filtre
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <PageHeader 
        title="Référentiel de bonnes pratiques" 
        description="Liste complète des items du référentiel de bonnes pratiques"
      />
      
      {/* Filtres et tri */}
      <div className="grid gap-6 mb-6">
        <ChecklistFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          subcategories={subcategories}
        />
        
        <div className="flex items-center gap-2">
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as ChecklistSortOption)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consigne_asc">Consigne (A-Z)</SelectItem>
              <SelectItem value="consigne_desc">Consigne (Z-A)</SelectItem>
              <SelectItem value="category_asc">Catégorie (A-Z)</SelectItem>
              <SelectItem value="category_desc">Catégorie (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Affichage du nombre de résultats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <List className="h-4 w-4" />
          <span>
            {isLoading 
              ? 'Chargement des items...' 
              : `${filteredChecklistItems.length} items sur ${checklistItems.length} au total`
            }
          </span>
        </div>
      </div>
      
      {/* Liste des items de checklist */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChecklistItems.map((item) => (
            <ChecklistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistPage;
