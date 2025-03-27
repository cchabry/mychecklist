
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { 
  useChecklistItems,
  filterChecklistItems,
  sortChecklistItems,
  extractUniqueCategories,
  extractUniqueSubcategories,
  extractUniqueProfiles,
  extractUniquePhases,
  ChecklistFilters,
  ChecklistSortOption,
  CHECKLIST_SORT_OPTIONS
} from '@/features/checklist';
import { 
  ChecklistItemGrid, 
  ChecklistItemProps 
} from '@/components/checklist';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Info, List } from 'lucide-react';
import { ChecklistFilter } from '@/features/checklist';

/**
 * Page principale de la checklist
 */
const ChecklistPage = () => {
  // État des filtres et du tri
  const [filters, setFilters] = useState<ChecklistFilters>({});
  const [sortOption, setSortOption] = useState<ChecklistSortOption>('priority_desc');
  
  // Récupérer les items de checklist
  const { data: items = [], isLoading, error } = useChecklistItems();
  
  // Extraire les valeurs uniques pour les filtres
  const categories = useMemo(() => extractUniqueCategories(items), [items]);
  const subcategories = useMemo(() => {
    if (filters.category) {
      return extractUniqueSubcategories(
        items.filter(item => item.category === filters.category)
      );
    }
    return extractUniqueSubcategories(items);
  }, [items, filters.category]);
  const profiles = useMemo(() => extractUniqueProfiles(items), [items]);
  const phases = useMemo(() => extractUniquePhases(items), [items]);
  
  // Filtrer et trier les items
  const filteredItems = useMemo(() => 
    sortChecklistItems(
      filterChecklistItems(items, filters),
      sortOption
    ),
    [items, filters, sortOption]
  );
  
  // Transformer les items pour le composant de grille
  const gridItems = useMemo<Omit<ChecklistItemProps, 'onClick' | 'onEdit' | 'className'>[]>(() => 
    filteredItems.map(item => ({
      id: item.id,
      consigne: item.consigne,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      references: item.reference,
      profiles: item.profil,
      phases: item.phase,
      effort: item.effort >= 4 ? 'ÉLEVÉ' : (item.effort >= 3 ? 'MOYEN' : 'FAIBLE'),
      priority: item.priority >= 4 ? 'HAUTE' : (item.priority >= 3 ? 'MOYENNE' : 'BASSE')
    })),
    [filteredItems]
  );
  
  // Gestion des erreurs
  if (error) {
    return (
      <div>
        <PageHeader 
          title="Checklist" 
          description="Consultez et gérez les critères d'évaluation"
        />
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Erreur
            </CardTitle>
            <CardDescription>
              Impossible de charger les items de checklist. Veuillez réessayer plus tard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader 
        title="Checklist" 
        description="Consultez et gérez les critères d'évaluation"
      />
      
      {/* Filtres et tri */}
      <div className="grid gap-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <ChecklistFilter
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
            subcategories={subcategories}
            profiles={profiles}
            phases={phases}
            className="flex-grow"
          />
          
          <div className="flex items-center gap-2">
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as ChecklistSortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {CHECKLIST_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Affichage du nombre de résultats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <List className="h-4 w-4" />
          <span>
            {isLoading 
              ? 'Chargement des items...' 
              : `${filteredItems.length} ${filteredItems.length > 1 ? 'items' : 'item'} sur ${items.length} au total`
            }
          </span>
        </div>
      </div>
      
      {/* Liste des items */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ChecklistItemGrid 
          items={gridItems}
          onItemClick={(id) => console.log('Item clicked:', id)}
          columns={3}
        />
      )}
    </div>
  );
};

export default ChecklistPage;
