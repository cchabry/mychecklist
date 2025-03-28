
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { getProjects } from '@/features/projects';
import { useLoadingState } from '@/hooks/form';
import { useOperationMode } from '@/hooks/useOperationMode';
import { useErrorHandler } from '@/hooks/error';

/**
 * Hook personnalisé pour récupérer et gérer la liste des projets
 * 
 * Ce hook encapsule la logique de chargement des projets depuis l'API Notion,
 * gère l'état de chargement et les erreurs potentielles.
 * 
 * @returns Un objet contenant:
 *   - projects: La liste des projets récupérés
 *   - isLoading: L'état de chargement (true pendant le chargement)
 *   - error: Erreur potentielle survenue lors du chargement
 *   - isDemoMode: Indique si l'application est en mode démonstration
 * 
 * @example
 * ```tsx
 * const { projects, isLoading, error } = useProjects();
 * 
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorDisplay error={error} />;
 * 
 * return (
 *   <div>
 *     {projects.map(project => (
 *       <ProjectCard key={project.id} project={project} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { handleError, clearError, lastError } = useErrorHandler();
  const { isDemoMode } = useOperationMode();
  
  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer les projets
     */
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
    error: lastError,
    isDemoMode
  };
};
