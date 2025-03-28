
/**
 * Hook pour accéder à la liste des projets
 */

import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/features/projects';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les projets
 * 
 * @returns Résultat de la requête contenant les projets
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        return await getProjects();
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        toast.error('Erreur de chargement', {
          description: 'Impossible de récupérer la liste des projets'
        });
        throw error;
      }
    }
  });
}
