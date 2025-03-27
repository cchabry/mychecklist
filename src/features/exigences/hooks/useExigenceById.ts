
/**
 * Hook pour récupérer une exigence par son identifiant
 * 
 * Ce hook utilise React Query pour récupérer et mettre en cache les données
 * d'une exigence spécifique identifiée par son ID.
 */

import { useQuery } from '@tanstack/react-query';
import { getExigenceById } from '..';

/**
 * Hook pour récupérer une exigence par son identifiant
 * 
 * @param id - Identifiant de l'exigence à récupérer
 * @returns Résultat de la requête contenant l'exigence
 * 
 * @example
 * ```tsx
 * const { data: exigence, isLoading, error } = useExigenceById('exigence-123');
 * 
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorDisplay error={error} />;
 * if (!exigence) return <NotFound />;
 * 
 * return (
 *   <div>
 *     <h1>Exigence pour l'item {exigence.itemId}</h1>
 *     <p>Importance: {exigence.importance}</p>
 *   </div>
 * );
 * ```
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
