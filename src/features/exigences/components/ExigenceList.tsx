
import { ExigenceWithItem } from '../types';
import { ExigenceCard } from './ExigenceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ExigenceListProps {
  isLoading: boolean;
  exigences: ExigenceWithItem[];
  projectId: string;
}

/**
 * Liste des exigences avec état de chargement et état vide
 */
export function ExigenceList({ isLoading, exigences, projectId }: ExigenceListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  if (exigences.length === 0) {
    return (
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
    );
  }
  
  return (
    <div className="grid gap-4">
      {exigences.map((exigence) => (
        <ExigenceCard 
          key={exigence.id} 
          exigence={exigence} 
          onClick={() => window.location.href = `/projects/${projectId}/exigences/${exigence.id}`}
        />
      ))}
    </div>
  );
}

export default ExigenceList;
