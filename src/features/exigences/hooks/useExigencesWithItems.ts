
/**
 * Hook pour récupérer les exigences enrichies avec leurs items de checklist
 * 
 * Ce hook combine les données d'exigences avec celles des items de checklist associés,
 * facilitant l'affichage des exigences avec leurs informations complètes.
 */

import { useQuery } from '@tanstack/react-query';
import { useExigences } from './useExigences';
import { useChecklistItems } from '@/features/checklist/hooks';
import { enrichExigencesWithItems } from '../utils';

/**
 * Hook pour récupérer les exigences d'un projet enrichies avec leurs items de checklist
 * 
 * @param projectId - Identifiant du projet
 * @returns Résultat de la requête contenant les exigences enrichies
 * 
 * @example
 * ```tsx
 * const { data: exigences, isLoading, error } = useExigencesWithItems('project-123');
 * 
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorDisplay error={error} />;
 * 
 * return (
 *   <div>
 *     <h1>Liste des exigences</h1>
 *     <ul>
 *       {exigences?.map(exigence => (
 *         <li key={exigence.id}>
 *           <strong>{exigence.checklistItem?.consigne}</strong> - 
 *           Importance: {exigence.importance}
 *         </li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 * ```
 */
export function useExigencesWithItems(projectId: string) {
  // Récupérer les exigences du projet
  const exigencesQuery = useExigences(projectId);
  
  // Récupérer tous les items de checklist
  const checklistItemsQuery = useChecklistItems();
  
  // Combiner les deux requêtes pour retourner les exigences enrichies
  return useQuery({
    queryKey: ['exigencesWithItems', projectId],
    queryFn: async () => {
      // Attendre que les deux requêtes se terminent
      const [exigences, checklistItems] = await Promise.all([
        exigencesQuery.data || [],
        checklistItemsQuery.data || []
      ]);
      
      // Enrichir les exigences avec les items de checklist
      return enrichExigencesWithItems(exigences, checklistItems);
    },
    // Activer uniquement si les deux requêtes sont activées et terminées
    enabled: !!(exigencesQuery.data && checklistItemsQuery.data),
    // Dépendre des résultats des deux requêtes
    staleTime: Math.min(
      exigencesQuery.staleTime || 0,
      checklistItemsQuery.staleTime || 0
    )
  });
}
