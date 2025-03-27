
/**
 * Hook pour accéder à une page d'échantillon par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer une page d'échantillon par son ID
 * 
 * @param id - Identifiant de la page à récupérer
 * @returns Résultat de la requête contenant la page
 */
export function useSamplePageById(id?: string) {
  return useQuery({
    queryKey: ['samplePage', id],
    queryFn: async () => {
      if (!id) return null;
      return await notionApi.getSamplePageById(id);
    },
    enabled: !!id
  });
}
