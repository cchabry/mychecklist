
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { notionApi } from '@/services/api';
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
        const data = await notionApi.getProjectById(projectId);
        setProject(data);
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
  }, [projectId, startLoading, stopLoading, setErrorMessage]);
  
  return {
    project,
    isLoading,
    error
  };
};
