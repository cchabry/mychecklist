
/**
 * Hook pour accéder aux projets
 */

import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/features/projects';
import { useOperationMode } from './useOperationMode';
import { Project } from '@/types/domain';
import { AppError, ErrorType } from '@/types/error';

/**
 * Hook pour récupérer tous les projets
 * 
 * @returns Résultat de la requête contenant les projets
 */
export function useProjects() {
  const { isDemoMode } = useOperationMode();
  
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      try {
        return await getProjects();
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        const appError: AppError = {
          type: ErrorType.NOTION,
          message: 'Impossible de récupérer les projets',
          name: 'FetchProjectsError',
          technicalMessage: error instanceof Error ? error.message : String(error)
        };
        throw appError;
      }
    }
  });
  
  // Retourner un objet structuré avec les projets et le statut de chargement
  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    error: query.error as AppError | null,
    isDemoMode
  };
}
