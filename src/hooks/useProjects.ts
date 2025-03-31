
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { getProjects } from '@/features/projects';
import { useLoadingState } from '@/hooks/form';
import { useOperationMode } from '@/hooks/useOperationMode';
import { toast } from 'sonner';

/**
 * Hook pour récupérer la liste des projets
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { isLoading, error, startLoading, stopLoading, setErrorMessage } = useLoadingState();
  const { isDemoMode } = useOperationMode();
  
  useEffect(() => {
    const fetchProjects = async () => {
      startLoading();
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        setErrorMessage('Impossible de récupérer les projets');
        toast.error('Erreur de chargement', {
          description: 'Impossible de récupérer les projets'
        });
      } finally {
        stopLoading();
      }
    };
    
    fetchProjects();
  }, []);
  
  return {
    projects,
    isLoading,
    error,
    isDemoMode
  };
};
