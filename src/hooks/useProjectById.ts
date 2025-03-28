
/**
 * Hook pour récupérer un projet par son ID
 */

import { useEntityQuery } from './api/useGenericQuery';
import { notionService } from '@/services/notion/notionService';
import { Project } from '@/types/domain';

/**
 * Hook pour récupérer un projet par son ID
 * 
 * @param id - Identifiant du projet
 * @returns Résultat de la requête contenant le projet
 */
export const useProjectById = (id?: string) => {
  return useEntityQuery<Project>(
    'project',
    id,
    (projectId) => notionService.getProjectById(projectId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export default useProjectById;
