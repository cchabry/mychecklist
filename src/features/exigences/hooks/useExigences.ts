
/**
 * Hook pour accéder aux exigences d'un projet
 */

import { useQuery } from '@tanstack/react-query';
import { getExigences } from '..';

/**
 * Hook pour récupérer toutes les exigences d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Résultat de la requête contenant les exigences
 */
export function useExigences(projectId: string) {
  return useQuery({
    queryKey: ['exigences', projectId],
    queryFn: async () => {
      return await getExigences(projectId);
    },
    enabled: !!projectId
  });
}
