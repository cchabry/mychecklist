
/**
 * Hook pour accéder aux évaluations d'un audit
 */

import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer toutes les évaluations d'un audit
 * 
 * @param auditId - Identifiant de l'audit
 * @returns Résultat de la requête contenant les évaluations
 */
export function useEvaluations(auditId: string) {
  return useQuery({
    queryKey: ['evaluations', auditId],
    queryFn: async () => {
      return await notionApi.getEvaluations(auditId);
    },
    enabled: !!auditId
  });
}
