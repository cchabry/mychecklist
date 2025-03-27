
/**
 * Hook pour récupérer toutes les exigences d'un projet
 * 
 * Ce hook utilise React Query pour récupérer et mettre en cache la liste
 * des exigences définies pour un projet spécifique.
 */

import { useQuery } from '@tanstack/react-query';
import { getExigences } from '..';

/**
 * Hook pour récupérer toutes les exigences d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Résultat de la requête contenant les exigences
 * 
 * @example
 * ```tsx
 * const { data: exigences, isLoading, error } = useExigences('project-123');
 * 
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorDisplay error={error} />;
 * 
 * return (
 *   <div>
 *     <h1>Exigences du projet</h1>
 *     <ul>
 *       {exigences?.map(exigence => (
 *         <li key={exigence.id}>
 *           Item: {exigence.itemId} - Importance: {exigence.importance}
 *         </li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 * ```
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
