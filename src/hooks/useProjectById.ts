
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { getProjectById } from '@/features/projects';
import { useLoadingState } from '@/hooks/form';
import { toast } from 'sonner';

/**
 * Hook pour récupérer un projet par son ID
 */
export const useProjectById = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const { isLoading, error, startLoading, stopLoading, setErrorMessage } = useLoadingState();
  
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      startLoading();
      try {
        const data = await getProjectById(projectId);
        setProject(data || null);
        if (!data) {
          toast.error('Projet non trouvé', {
            description: `Le projet avec l'ID ${projectId} n'existe pas.`
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du projet #${projectId}:`, error);
        setErrorMessage(`Impossible de récupérer le projet #${projectId}`);
        toast.error('Erreur de chargement', {
          description: `Impossible de récupérer le projet #${projectId}`
        });
      } finally {
        stopLoading();
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  return {
    project,
    isLoading,
    error
  };
};

