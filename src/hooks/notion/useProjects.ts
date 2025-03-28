
/**
 * Hook pour accéder aux services de projets
 * 
 * Ce hook utilise le service de projets pour fournir des méthodes
 * pour gérer les projets (récupération, création, mise à jour, suppression).
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/notion/project/projectService';
import { Project } from '@/types/domain';
import { CreateProjectData, UpdateProjectData } from '@/features/projects/types';
import { useNotionErrorHandler } from './useNotionErrorHandler';
import { toast } from 'sonner';

/**
 * Hook pour gérer les projets via l'API Notion
 * 
 * Ce hook fournit des méthodes pour récupérer, créer, mettre à jour et supprimer
 * des projets via le service de projets.
 */
export function useProjects() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleNotionError } = useNotionErrorHandler();
  const queryClient = useQueryClient();
  
  // Récupérer la liste des projets
  const { data: projects = [], isLoading: isLoadingProjects, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await projectService.getAll();
        // Vérifier si la réponse est une NotionResponse
        if ('success' in response) {
          if (!response.success) {
            throw new Error(response.error?.message || 'Erreur lors de la récupération des projets');
          }
          return response.data || [];
        }
        // Si c'est directement un tableau, retourner le tableau
        return response;
      } catch (error) {
        handleNotionError(error, {
          endpoint: '/databases/query',
          toastTitle: 'Erreur de chargement',
          switchToDemo: true,
          demoReason: 'Impossible de récupérer les projets'
        });
        return [];
      }
    }
  });
  
  // Récupérer un projet par son ID
  const getProjectById = useCallback(async (id: string): Promise<Project | null> => {
    setIsLoading(true);
    try {
      const response = await projectService.getById(id);
      // Vérifier si la réponse est une NotionResponse
      if (response && 'success' in response) {
        if (!response.success) {
          throw new Error(response.error?.message || `Projet #${id} non trouvé`);
        }
        return response.data || null;
      }
      // Si c'est directement un objet Project, le retourner
      return response;
    } catch (error) {
      handleNotionError(error, {
        endpoint: `/pages/${id}`,
        toastTitle: 'Erreur de chargement',
        toastMessage: `Impossible de récupérer le projet #${id}`
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleNotionError]);
  
  // Créer un projet
  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectData): Promise<Project> => {
      try {
        const response = await projectService.create(data);
        // Vérifier si la réponse est une NotionResponse
        if ('success' in response) {
          if (!response.success) {
            throw new Error(response.error?.message || 'Erreur lors de la création du projet');
          }
          const project = response.data;
          if (!project) {
            throw new Error('Erreur lors de la création du projet: aucune donnée retournée');
          }
          return project;
        }
        // Retourner l'objet Project
        return response;
      } catch (error) {
        handleNotionError(error, {
          endpoint: '/pages',
          toastTitle: 'Erreur de création',
          toastMessage: 'Impossible de créer le projet'
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Projet créé', {
        description: 'Le projet a été créé avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
  
  // Mettre à jour un projet
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectData }): Promise<Project> => {
      try {
        // Récupérer le projet existant pour compléter les données manquantes
        const existingProject = await getProjectById(id);
        if (!existingProject) {
          throw new Error(`Projet #${id} non trouvé`);
        }
        
        // Fusionner les données existantes avec les nouvelles
        const updatedProject = {
          ...existingProject,
          ...data,
        };
        
        const response = await projectService.update(updatedProject);
        // Vérifier si la réponse est une NotionResponse
        if ('success' in response) {
          if (!response.success) {
            throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet #${id}`);
          }
          const project = response.data;
          if (!project) {
            throw new Error(`Erreur lors de la mise à jour du projet #${id}: aucune donnée retournée`);
          }
          return project;
        }
        // Retourner l'objet Project
        return response;
      } catch (error) {
        handleNotionError(error, {
          endpoint: `/pages/${id}`,
          toastTitle: 'Erreur de mise à jour',
          toastMessage: `Impossible de mettre à jour le projet #${id}`
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast.success('Projet mis à jour', {
        description: 'Le projet a été mis à jour avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    }
  });
  
  // Supprimer un projet
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      try {
        const response = await projectService.delete(id);
        // Vérifier si la réponse est une NotionResponse
        if ('success' in response) {
          if (!response.success) {
            throw new Error(response.error?.message || `Erreur lors de la suppression du projet #${id}`);
          }
          return true;
        }
        // Si la réponse est directement un booléen
        return response;
      } catch (error) {
        handleNotionError(error, {
          endpoint: `/pages/${id}`,
          toastTitle: 'Erreur de suppression',
          toastMessage: `Impossible de supprimer le projet #${id}`
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Projet supprimé', {
        description: 'Le projet a été supprimé avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
  
  return {
    // Données
    projects,
    isLoading: isLoading || isLoadingProjects,
    error,
    
    // Méthodes
    getProjectById,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    
    // États des mutations
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending
  };
}
