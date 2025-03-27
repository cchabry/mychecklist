
/**
 * Hook pour accéder aux évaluations d'un audit
 */

import { useQuery } from '@tanstack/react-query';
import { getEvaluations } from '..';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les évaluations d'un audit
 * 
 * @param auditId - Identifiant de l'audit
 * @param pageId - Identifiant de la page (optionnel)
 * @param exigenceId - Identifiant de l'exigence (optionnel)
 * @returns Résultat de la requête contenant les évaluations
 */
export function useEvaluations(auditId: string, pageId?: string, exigenceId?: string) {
  return useQuery({
    queryKey: ['evaluations', auditId, pageId, exigenceId].filter(Boolean),
    queryFn: async () => {
      if (!auditId) return [];
      
      try {
        return await getEvaluations(auditId, pageId, exigenceId);
      } catch (error) {
        console.error(`Erreur lors de la récupération des évaluations:`, error);
        toast.error('Erreur de chargement', {
          description: 'Impossible de récupérer les évaluations'
        });
        throw error;
      }
    },
    enabled: !!auditId
  });
}
