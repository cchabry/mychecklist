
/**
 * Hook pour accéder aux actions correctives
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer toutes les actions correctives d'une évaluation
 * 
 * @param evaluationId - Identifiant de l'évaluation
 * @returns Résultat de la requête contenant les actions
 */
export function useActions(evaluationId: string) {
  return useQuery({
    queryKey: ['actions', evaluationId],
    queryFn: async () => {
      return await notionApi.getActions(evaluationId);
    },
    enabled: !!evaluationId
  });
}
