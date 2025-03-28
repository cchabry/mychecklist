
/**
 * Hooks liés aux projets Notion
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/notion/project';
import { useNotionErrorHandler } from './useNotionErrorHandler';
import type { CreateProjectInput, UpdateProjectInput } from '@/services/notion/project/types';
import { ProjectStatus, mapStringToProjectStatus } from '@/types/enums';

/**
 * Hook pour récupérer tous les projets Notion
 * 
 * @returns Résultat de requête pour les projets
 */
export function useNotionProjects() {
  const { handleNotionError } = useNotionErrorHandler();
  
  return useQuery({
    queryKey: ['notion', 'projects'],
    queryFn: async () => {
      try {
        const response = await projectService.getProjects();
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Erreur lors de la récupération des projets');
        }
        return response.data;
      } catch (error) {
        throw handleNotionError(error, {
          endpoint: 'getProjects',
          toastTitle: 'Erreur de récupération',
          toastMessage: 'Impossible de récupérer la liste des projets'
        });
      }
    }
  });
}

/**
 * Hook pour récupérer un projet Notion par son ID
 * 
 * @param id - ID du projet à récupérer
 * @returns Résultat de requête pour le projet
 */
export function useNotionProjectById(id: string) {
  const { handleNotionError } = useNotionErrorHandler();
  
  return useQuery({
    queryKey: ['notion', 'project', id],
    queryFn: async () => {
      try {
        const response = await projectService.getProjectById(id);
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || `Erreur lors de la récupération du projet ${id}`);
        }
        return response.data;
      } catch (error) {
        throw handleNotionError(error, {
          endpoint: `getProjectById/${id}`,
          toastTitle: 'Erreur de récupération',
          toastMessage: `Impossible de récupérer le projet #${id}`
        });
      }
    },
    enabled: !!id
  });
}

/**
 * Hook pour créer un projet Notion
 * 
 * @returns Mutation pour créer un projet
 */
export function useCreateNotionProject() {
  const queryClient = useQueryClient();
  const { handleNotionError } = useNotionErrorHandler();
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectInput) => {
      try {
        const response = await projectService.createProject(projectData);
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Erreur lors de la création du projet');
        }
        return response.data;
      } catch (error) {
        throw handleNotionError(error, {
          endpoint: 'createProject',
          toastTitle: 'Erreur de création',
          toastMessage: 'Impossible de créer le projet'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notion', 'projects'] });
    }
  });
}

/**
 * Hook pour mettre à jour un projet Notion
 * 
 * @returns Mutation pour mettre à jour un projet
 */
export function useUpdateNotionProject() {
  const queryClient = useQueryClient();
  const { handleNotionError } = useNotionErrorHandler();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProjectInput) => {
      // Conversion du statut si c'est une chaîne
      if (typeof data.status === 'string') {
        data.status = mapStringToProjectStatus(data.status);
      }
      
      try {
        const response = await projectService.updateProject(id, data);
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet ${id}`);
        }
        return response.data;
      } catch (error) {
        throw handleNotionError(error, {
          endpoint: `updateProject/${id}`,
          toastTitle: 'Erreur de mise à jour',
          toastMessage: `Impossible de mettre à jour le projet #${id}`
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notion', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['notion', 'project', variables.id] });
    }
  });
}

/**
 * Hook pour supprimer un projet Notion
 * 
 * @returns Mutation pour supprimer un projet
 */
export function useDeleteNotionProject() {
  const queryClient = useQueryClient();
  const { handleNotionError } = useNotionErrorHandler();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await projectService.deleteProject(id);
        if (!response.success) {
          throw new Error(response.error?.message || `Erreur lors de la suppression du projet ${id}`);
        }
        return response.data;
      } catch (error) {
        throw handleNotionError(error, {
          endpoint: `deleteProject/${id}`,
          toastTitle: 'Erreur de suppression',
          toastMessage: `Impossible de supprimer le projet #${id}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notion', 'projects'] });
    }
  });
}
