
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { 
  useExigences,
  useChecklistItems,
  enrichExigencesWithItems,
  filterExigences,
  sortExigences,
  extractUniqueCategories,
  extractUniqueSubcategories,
  ExigenceFilters,
  ExigenceSortOption,
  EXIGENCE_SORT_OPTIONS,
  ImportanceBadge,
  ExigenceCard,
  ExigenceFilter
} from '@/features/exigences';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Info, List, PlusCircle } from 'lucide-react';

/**
 * Page des exigences d'un projet
 */
const ProjectExigencesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // État des filtres et du tri
  const [filters, setFilters] = useState<ExigenceFilters>({});
  const [sortOption, setSortOption] = useState<ExigenceSortOption>('importance_desc');
  
  // Récupérer les exigences du projet
  const { data: exigences = [], isLoading: isLoadingExigences, error: exigencesError } = useExigences(projectId || '');
  
  // Récupérer les items de checklist pour enrichir les exigences
  const { data: checklistItems = [], isLoading: isLoadingItems } = useChecklistItems();
  
  // Enrichir les exigences avec les détails des items de checklist
  const exigencesWithItems = useMemo(() => 
    enrichExigencesWithItems(exigences, checklistItems),
    [exigences, checklistItems]
  );
  
  // Extraire les valeurs uniques pour les filtres
  const categories = useMemo(() => 
    extractUniqueCategories(exigencesWithItems),
    [exigencesWithItems]
  );
  
  const subcategories = useMemo(() => {
    if (filters.category) {
      return extractUniqueSubcategories(
        exigencesWithItems.filter(item => item.checklistItem.category === filters.category)
      );
    }
    return extractUniqueSubcategories(exigencesWithItems);
  }, [exigencesWithItems, filters.category]);
  
  // Filtrer et trier les exigences
  const filteredExigences = useMemo(() => 
    sortExigences(
      filterExigences(exigencesWithItems, filters),
      sortOption
    ),
    [exigencesWithItems, filters, sortOption]
  );
  
  // État de chargement combiné
  const isLoading = isLoadingExigences || isLoadingItems;
  
  // Gestion des erreurs
  if (exigencesError) {
    return (
      <div>
        <PageHeader 
          title="Exigences du projet" 
          description="Gestion des exigences et critères d'évaluation"
        />
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Erreur
            </CardTitle>
            <CardDescription>
              Impossible de charger les exigences du projet. Veuillez réessayer plus tard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
              {exigencesError instanceof Error ? exigencesError.message : String(exigencesError)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader 
        title="Exigences du projet" 
        description="Gestion des exigences et critères d'évaluation"
        actions={
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Ajouter une exigence
          </Button>
        }
      />
      
      {/* Filtres et tri */}
      <div className="grid gap-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <ExigenceFilter
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
            subcategories={subcategories}
            className="flex-grow"
          />
          
          <div className="flex items-center gap-2">
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as ExigenceSortOption)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {EXIGENCE_SORT_OPTIONS.map((option) => (
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
              ? 'Chargement des exigences...' 
              : `${filteredExigences.length} ${filteredExigences.length > 1 ? 'exigences' : 'exigence'} sur ${exigencesWithItems.length} au total`
            }
          </span>
        </div>
      </div>
      
      {/* Liste des exigences */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredExigences.length === 0 ? (
        <Card className="p-6 text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Aucune exigence ne correspond aux critères de recherche.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setFilters({})}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExigences.map((exigence) => (
            <ExigenceCard
              key={exigence.id}
              exigence={exigence}
              onEdit={() => console.log('Edit exigence:', exigence.id)}
              onClick={() => console.log('View exigence:', exigence.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectExigencesPage;
