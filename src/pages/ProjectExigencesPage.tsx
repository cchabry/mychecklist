
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useExigences, 
  ExigenceFilter,
  ExigenceStats,
  ExigenceSortBar,
  ExigenceList,
  filterExigences,
  sortExigences,
  enrichExigencesWithItems,
  ExigenceSortOption
} from '@/features/exigences';
import { useChecklistItems } from '@/features/checklist';
import { useProjectById } from '@/hooks/useProjectById';
import { PageHeader } from '@/components/layout';
import { PlusCircle, Tag } from 'lucide-react';
import { ImportanceLevel } from '@/types/enums';
import { extractUniqueCategories, extractUniqueSubcategories } from '@/features/checklist';

/**
 * Page affichant les exigences d'un projet
 */
const ProjectExigencesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Récupérer les données du projet et des exigences
  const { project, isLoading: isLoadingProject } = useProjectById(projectId || '');
  const { data: exigences = [], isLoading: isLoadingExigences } = useExigences(projectId || '');
  const { data: checklistItems = [], isLoading: isLoadingChecklist } = useChecklistItems();
  
  // État des filtres et du tri
  const [filters, setFilters] = useState<{ search: string, category?: string, subCategory?: string, importance?: ImportanceLevel }>({ search: '' });
  const [sortOption, setSortOption] = useState<ExigenceSortOption>('importance_desc');
  
  // Enrichir les exigences avec les informations des items de checklist
  const exigencesWithItems = useMemo(() => {
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
      [ImportanceLevel.Major]: exigences.filter(e => e.importance === ImportanceLevel.Major).length,
      [ImportanceLevel.Important]: exigences.filter(e => e.importance === ImportanceLevel.Important).length,
      [ImportanceLevel.Medium]: exigences.filter(e => e.importance === ImportanceLevel.Medium).length,
      [ImportanceLevel.Minor]: exigences.filter(e => e.importance === ImportanceLevel.Minor).length,
      [ImportanceLevel.NotApplicable]: exigences.filter(e => e.importance === ImportanceLevel.NotApplicable).length,
    };
    
    return { total, byImportance };
  }, [exigences]);
  
  // Déterminer si les données sont en cours de chargement
  const isLoading = isLoadingProject || isLoadingExigences || isLoadingChecklist;
  
  // Gestionnaire de changement de filtre
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters });
  };
  
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
        <ExigenceStats stats={stats} />
      </div>
      
      {/* Filtres et tri */}
      <div className="grid gap-6">
        <ExigenceFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          subcategories={subcategories}
        />
        
        <ExigenceSortBar
          isLoading={isLoading}
          sortOption={sortOption}
          onSortChange={(value) => setSortOption(value)}
          totalCount={exigences.length}
          filteredCount={filteredExigences.length}
        />
      </div>
      
      {/* Liste des exigences */}
      <ExigenceList 
        isLoading={isLoading}
        exigences={filteredExigences}
        projectId={projectId || ''}
      />
    </div>
  );
};

export default ProjectExigencesPage;
