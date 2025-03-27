
/**
 * Hook pour accéder à une exigence par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { getExigenceById } from '..';

/**
 * Hook pour récupérer une exigence par son ID
 * 
 * @param id - Identifiant de l'exigence à récupérer
 * @returns Résultat de la requête contenant l'exigence
 */
export function useExigenceById(id?: string) {
  return useQuery({
    queryKey: ['exigence', id],
    queryFn: async () => {
      if (!id) return null;
      return await getExigenceById(id);
    },
    enabled: !!id
  });
}
