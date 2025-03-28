
/**
 * Hook pour récupérer tous les projets
 */

import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/features/projects';
import { AppError, ErrorType } from '@/types/error';
import { Project } from '@/types/domain';

/**
 * Hook pour récupérer tous les projets
 * 
 * @returns Résultat de la requête contenant les projets
 */
export function useProjects() {
  return useQuery({
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
}
