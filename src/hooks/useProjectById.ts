
import { useQuery } from '@tanstack/react-query';
import { Project } from '@/types/domain';
import { getProjectById } from '@/features/projects';
import { useOperationMode } from '@/hooks/useOperationMode';
import { useErrorHandler } from '@/hooks/error';
import { toast } from 'sonner';

/**
 * Hook personnalisé pour récupérer et gérer un projet spécifique
 * 
 * Ce hook encapsule la logique de chargement d'un projet spécifique depuis l'API Notion,
 * gère l'état de chargement et les erreurs potentielles.
 * 
 * @param id - Identifiant du projet à récupérer
 * @returns Un objet contenant:
 *   - project: Le projet récupéré, ou null si non trouvé
 *   - isLoading: L'état de chargement
 *   - error: Erreur potentielle survenue lors du chargement
 */
const useProjectById = (id: string) => {
  const { handleError, lastError } = useErrorHandler();
  const { isDemoMode } = useOperationMode();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        return await getProjectById(id);
      } catch (error) {
        toast.error('Erreur de chargement', {
          description: `Impossible de récupérer le projet #${id}`
        });
        handleError(error, {
          showToast: false, // Déjà affiché ci-dessus
          logToConsole: true
        });
        return null;
      }
    },
    enabled: !!id
  });
  
  return {
    project,
    isLoading,
    error: error || lastError,
    isDemoMode
  };
};

export default useProjectById;
