
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { getProjectById } from '@/features/projects';
import { useLoadingState } from '@/hooks/form';
import { useOperationMode } from '@/hooks/useOperationMode';
import { useErrorHandler } from '@/hooks/error';

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
  const [project, setProject] = useState<Project | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { handleError, clearError, lastError } = useErrorHandler();
  const { isDemoMode } = useOperationMode();
  
  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer le projet
     */
    const fetchProject = async () => {
      if (!id) return;
      
      clearError();
      startLoading();
      
      try {
        const data = await getProjectById(id);
        setProject(data);
      } catch (error) {
        handleError(error, {
          showToast: true,
          toastTitle: 'Erreur de chargement',
          toastMessage: `Impossible de récupérer le projet #${id}`,
          logToConsole: true
        });
      } finally {
        stopLoading();
      }
    };
    
    fetchProject();
  }, [id]);
  
  return {
    project,
    isLoading,
    error: lastError,
    isDemoMode
  };
};

export default useProjectById;
