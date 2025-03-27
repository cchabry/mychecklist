
/**
 * Hook pour accéder au suivi des progrès d'une action
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer le suivi des progrès d'une action
 * 
 * @param actionId - Identifiant de l'action
 * @returns Résultat de la requête contenant les progrès
 */
export function useActionProgress(actionId: string) {
  return useQuery({
    queryKey: ['actionProgress', actionId],
    queryFn: async () => {
      return await notionApi.getActionProgress(actionId);
    },
    enabled: !!actionId
  });
}
