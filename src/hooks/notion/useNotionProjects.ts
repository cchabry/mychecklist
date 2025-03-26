
/**
 * Hook pour gérer les projets via Notion
 */

import { useState, useCallback } from 'react';
import { notionService } from '@/services/notion/notionService';
import { Project } from '@/types/domain';
import { toast } from 'sonner';

/**
 * Hook pour la gestion des projets
 */
export function useNotionProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Charge tous les projets
   */
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionService.getProjects();
      
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        throw new Error(response.error?.message || 'Erreur lors du chargement des projets');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les projets'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Charge un projet par son ID
   */
  const fetchProjectById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionService.getProjectById(id);
      
      if (response.success && response.data) {
        setCurrentProject(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || `Projet #${id} non trouvé`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de chargement', {
        description: `Impossible de charger le projet #${id}`
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Crée un nouveau projet
   */
  const createProject = useCallback(async (data: { name: string; url?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionService.createProject(data);
      
      if (response.success && response.data) {
        toast.success('Projet créé', {
          description: `Le projet "${data.name}" a été créé avec succès`
        });
        
        // Recharger la liste des projets
        await fetchProjects();
        
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Erreur lors de la création du projet');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de création', {
        description: 'Impossible de créer le projet'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects]);
  
  /**
   * Met à jour un projet
   */
  const updateProject = useCallback(async (id: string, data: { name?: string; url?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionService.updateProject(id, data);
      
      if (response.success && response.data) {
        toast.success('Projet mis à jour', {
          description: `Le projet a été mis à jour avec succès`
        });
        
        // Mettre à jour le projet courant si c'est celui qui est modifié
        if (currentProject && currentProject.id === id) {
          setCurrentProject(response.data);
        }
        
        // Recharger la liste des projets
        await fetchProjects();
        
        return response.data;
      } else {
        throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet #${id}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de mise à jour', {
        description: `Impossible de mettre à jour le projet #${id}`
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, currentProject]);
  
  /**
   * Supprime un projet
   */
  const deleteProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionService.deleteProject(id);
      
      if (response.success && response.data) {
        toast.success('Projet supprimé', {
          description: `Le projet a été supprimé avec succès`
        });
        
        // Réinitialiser le projet courant s'il s'agit de celui supprimé
        if (currentProject && currentProject.id === id) {
          setCurrentProject(null);
        }
        
        // Recharger la liste des projets
        await fetchProjects();
        
        return true;
      } else {
        throw new Error(response.error?.message || `Erreur lors de la suppression du projet #${id}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de suppression', {
        description: `Impossible de supprimer le projet #${id}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, currentProject]);
  
  return {
    projects,
    currentProject,
    isLoading,
    error,
    
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject
  };
}
