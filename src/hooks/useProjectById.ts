
import { useQuery } from '@tanstack/react-query';
import { getProjectById } from '@/features/projects';
import { toast } from 'sonner';

/**
 * Hook pour récupérer un projet par son ID en utilisant React Query
 * 
 * @param projectId - Identifiant du projet à récupérer
 * @returns Résultat de la requête contenant le projet et l'état de chargement
 */
export const useProjectById = (projectId: string) => {
  const result = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      try {
        const data = await getProjectById(projectId);
        if (!data) {
          toast.error('Projet non trouvé', {
            description: `Le projet avec l'ID ${projectId} n'existe pas.`
          });
        }
        return data;
      } catch (error) {
        console.error(`Erreur lors de la récupération du projet #${projectId}:`, error);
        toast.error('Erreur de chargement', {
          description: `Impossible de récupérer le projet #${projectId}`
        });
        throw error; // Propager l'erreur pour que React Query puisse la gérer
      }
    },
    enabled: !!projectId
  });
  
  return {
    project: result.data,
    isLoading: result.isLoading,
    error: result.error
  };
};

export default useProjectById;
