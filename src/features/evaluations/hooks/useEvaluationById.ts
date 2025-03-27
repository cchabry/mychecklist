
/**
 * Hook pour accéder à une évaluation par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer une évaluation par son ID
 * 
 * @param id - Identifiant de l'évaluation à récupérer
 * @returns Résultat de la requête contenant l'évaluation
 */
export function useEvaluationById(id?: string) {
  return useQuery({
    queryKey: ['evaluation', id],
    queryFn: async () => {
      if (!id) return null;
      return await notionApi.getEvaluationById(id);
    },
    enabled: !!id
  });
}
