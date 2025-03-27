
/**
 * Hook pour accéder aux pages d'échantillon d'un projet
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer toutes les pages d'échantillon d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Résultat de la requête contenant les pages d'échantillon
 */
export function useSamplePages(projectId: string) {
  return useQuery({
    queryKey: ['samplePages', projectId],
    queryFn: async () => {
      return await notionApi.getSamplePages(projectId);
    },
    enabled: !!projectId
  });
}
