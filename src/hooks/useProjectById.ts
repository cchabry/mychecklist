
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { notionApi } from '@/services/api';

/**
 * Hook pour récupérer un projet par son ID
 */
export function useProjectById(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchProject() {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await notionApi.getProjectById(projectId);
        setProject(data);
      } catch (err) {
        console.error('Erreur lors du chargement du projet:', err);
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProject();
  }, [projectId]);
  
  return { project, isLoading, error };
}
