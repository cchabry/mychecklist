import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { getProjects } from '@/features/projects';
import { useLoadingState } from '@/hooks/form';
import { useOperationMode } from '@/hooks/useOperationMode';
import { useErrorHandler } from '@/hooks/error';

/**
 * Hook pour récupérer la liste des projets
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { handleError, error, clearError } = useErrorHandler();
  const { isDemoMode } = useOperationMode();
  
  useEffect(() => {
    const fetchProjects = async () => {
      clearError();
      startLoading();
      
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        handleError(error, {
          showToast: true,
          toastTitle: 'Erreur de chargement',
          logToConsole: true
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
