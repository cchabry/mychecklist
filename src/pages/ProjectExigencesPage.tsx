
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useExigences, 
  ExigenceFilter, 
  ExigenceCard,
  filterExigences,
  sortExigences,
  enrichExigencesWithItems,
  ExigenceWithItem,
  ExigenceSortOption
} from '@/features/exigences';
import { useChecklistItems } from '@/features/checklist';
import { useProjectById } from '@/hooks/useProjectById';
import { PageHeader } from '@/components/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, List, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImportanceLevel } from '@/types/enums';
import { extractUniqueCategories, extractUniqueSubcategories } from '@/features/checklist';

/**
 * Page affichant les exigences d'un projet
 */
const ProjectExigencesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Récupérer les données du projet et des exigences
  const { data: project, isLoading: isLoadingProject } = useProjectById(projectId || '');
  const { data: exigences = [], isLoading: isLoadingExigences } = useExigences(projectId || '');
  const { data: checklistItems = [], isLoading: isLoadingChecklist } = useChecklistItems();
  
  // État des filtres et du tri
  const [filters, setFilters] = useState({ search: '' });
  const [sortOption, setSortOption] = useState<ExigenceSortOption>('importance_desc');
  
  // Enrichir les exigences avec les informations des items de checklist
  const exigencesWithItems = useMemo<ExigenceWithItem[]>(() => {
    if (exigences.length === 0 || checklistItems.length === 0) return [];
    return enrichExigencesWithItems(exigences, checklistItems);
  }, [exigences, checklistItems]);
  
  // Filtrer et trier les exigences
  const filteredExigences = useMemo(() => {
    let filtered = filterExigences(exigencesWithItems, filters);
    filtered = sortExigences(filtered, sortOption);
    return filtered;
  }, [exigencesWithItems, filters, sortOption]);
  
  // Extraire les valeurs uniques pour les filtres
  const categories = useMemo(() => 
    extractUniqueCategories(checklistItems),
    [checklistItems]
  );
  
  const subcategories = useMemo(() => 
    extractUniqueSubcategories(checklistItems),
    [checklistItems]
  );
  
  // Calculer les statistiques des exigences
  const stats = useMemo(() => {
    const total = exigences.length;
    const byImportance = {
      [ImportanceLevel.MAJOR]: exigences.filter(e => e.importance === ImportanceLevel.MAJOR).length,
      [ImportanceLevel.IMPORTANT]: exigences.filter(e => e.importance === ImportanceLevel.IMPORTANT).length,
      [ImportanceLevel.MEDIUM]: exigences.filter(e => e.importance === ImportanceLevel.MEDIUM).length,
      [ImportanceLevel.MINOR]: exigences.filter(e => e.importance === ImportanceLevel.MINOR).length,
      [ImportanceLevel.N_A]: exigences.filter(e => e.importance === ImportanceLevel.N_A).length,
    };
    
    return { total, byImportance };
  }, [exigences]);
  
  // Déterminer si les données sont en cours de chargement
  const isLoading = isLoadingProject || isLoadingExigences || isLoadingChecklist;
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Exigences${project ? ` : ${project.name}` : ''}`}
        description="Définition des exigences du projet basées sur les items du référentiel"
        actions={[
          {
            icon: <PlusCircle size={16} />,
            label: "Ajouter une exigence",
            href: `/projects/${projectId}/exigences/create`,
            variant: "default"
          },
          {
            icon: <Tag size={16} />,
            label: "Définir les exigences",
            href: `/projects/${projectId}/exigences/edit-bulk`,
            variant: "outline"
          }
        ]}
      />
      
      {/* Statistiques des exigences */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded-lg p-4 md:col-span-5">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Répartition des exigences par niveau d'importance</h3>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              Majeur: {stats.byImportance[ImportanceLevel.MAJOR]}
            </Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              Important: {stats.byImportance[ImportanceLevel.IMPORTANT]}
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Moyen: {stats.byImportance[ImportanceLevel.MEDIUM]}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              Mineur: {stats.byImportance[ImportanceLevel.MINOR]}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              Non applicable: {stats.byImportance[ImportanceLevel.N_A]}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Total: {stats.total}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Filtres et tri */}
      <div className="grid gap-6">
        <ExigenceFilter
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          subcategories={subcategories}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as ExigenceSortOption)}
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
                : `${filteredExigences.length} exigences sur ${exigences.length} au total`
              }
            </span>
          </div>
        </div>
      </div>
      
      {/* Liste des exigences */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredExigences.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune exigence définie</h3>
          <p className="text-gray-500 mb-6">
            Commencez par définir les exigences pour ce projet en sélectionnant des items du référentiel.
          </p>
          <Button asChild>
            <a href={`/projects/${projectId}/exigences/create`}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une exigence
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExigences.map((exigence) => (
            <ExigenceCard 
              key={exigence.id} 
              exigence={exigence} 
              href={`/projects/${projectId}/exigences/${exigence.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectExigencesPage;
