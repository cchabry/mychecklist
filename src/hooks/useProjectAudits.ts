
/**
 * Hook pour récupérer les audits d'un projet
 */

import { useQuery } from '@tanstack/react-query';
import { getProjectAudits } from '@/features/audits';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les audits d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Résultat de la requête contenant les audits
 */
export function useProjectAudits(projectId?: string) {
  return useQuery({
    queryKey: ['projectAudits', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      try {
        return await getProjectAudits(projectId);
      } catch (error) {
        console.error(`Erreur lors de la récupération des audits du projet ${projectId}:`, error);
        toast.error('Erreur de chargement', {
          description: 'Impossible de récupérer les audits du projet'
        });
        throw error;
      }
    },
    enabled: !!projectId
  });
}
