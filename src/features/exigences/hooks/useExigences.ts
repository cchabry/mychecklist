
/**
 * Hook pour accéder aux exigences d'un projet
 */

import { useGenericQuery } from '@/hooks/api/useGenericQuery';
import { exigenceService } from '@/services/notion';
import { Exigence } from '@/types/domain';

/**
 * Hook pour récupérer les exigences d'un projet
 * 
 * @param projectId ID du projet
 * @returns Résultat de la requête contenant les exigences
 */
export function useExigences(projectId: string | undefined) {
  return useGenericQuery<Exigence[]>(
    ['exigences', projectId],
    async () => {
      if (!projectId) {
        return { success: false, error: { message: 'ID de projet non défini' } };
      }
      return exigenceService.getExigences(projectId);
    },
    {
      enabled: !!projectId,
    }
  );
}
