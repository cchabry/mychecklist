
/**
 * Hook pour accéder à une action par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer une action corrective par son ID
 * 
 * @param id - Identifiant de l'action à récupérer
 * @returns Résultat de la requête contenant l'action
 */
export function useActionById(id?: string) {
  return useQuery({
    queryKey: ['action', id],
    queryFn: async () => {
      if (!id) return null;
      return await notionApi.getActionById(id);
    },
    enabled: !!id
  });
}
