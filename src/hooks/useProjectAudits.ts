
import { useQuery } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { toast } from 'sonner';

/**
 * Hook pour récupérer les audits d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Résultat de la requête contenant les audits
 */
export function useProjectAudits(projectId: string) {
  const result = useQuery({
    queryKey: ['audits', 'project', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      try {
        return await notionApi.getAudits(projectId);
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
  
  return {
    audits: result.data || [],
    isLoading: result.isLoading,
    error: result.error
  };
}

export default useProjectAudits;
