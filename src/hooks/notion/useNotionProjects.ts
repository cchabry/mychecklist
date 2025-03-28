
/**
 * Hook pour gérer les projets via l'API Notion
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/notion/project';
import { Project } from '@/types/domain';
import { CreateProjectInput, UpdateProjectInput } from '@/services/notion/project/types';
import { useNotionErrorHandler } from './useNotionErrorHandler';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les projets
 */
export function useNotionProjects() {
  const { handleNotionError } = useNotionErrorHandler();
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await projectService.getProjects();
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Erreur de chargement des projets');
        }
        
        return response.data || [];
      } catch (error) {
        handleNotionError(error, {
          toastTitle: 'Erreur de chargement',
          toastDescription: 'Impossible de récupérer la liste des projets'
        });
        return [];
      }
    }
  });
}

/**
 * Hook pour récupérer un projet par son ID
 */
export function useNotionProjectById(id: string | undefined) {
  const { handleNotionError } = useNotionErrorHandler();
  
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await projectService.getProjectById(id);
        
        if (!response.success) {
          throw new Error(response.error?.message || `Erreur de chargement du projet ${id}`);
        }
        
        return response.data || null;
      } catch (error) {
        handleNotionError(error, {
          toastTitle: 'Erreur de chargement',
          toastDescription: `Impossible de récupérer le projet ${id}`
        });
        return null;
      }
    },
    enabled: !!id
  });
}

/**
 * Hook pour créer un projet
 */
export function useCreateNotionProject() {
  const queryClient = useQueryClient();
  const { handleNotionError } = useNotionErrorHandler();
  
  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const response = await projectService.createProject(data);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Erreur lors de la création du projet');
      }
      
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet créé avec succès');
    },
    onError: (error) => {
      handleNotionError(error, {
        toastTitle: 'Erreur de création',
        toastDescription: 'Impossible de créer le projet'
      });
    }
  });
}

/**
 * Hook pour mettre à jour un projet
 */
export function useUpdateNotionProject() {
  const queryClient = useQueryClient();
  const { handleNotionError } = useNotionErrorHandler();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProjectInput) => {
      const response = await projectService.updateProject(id, data);
      
      if (!response.success) {
        throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet ${id}`);
      }
      
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success('Projet mis à jour avec succès');
    },
    onError: (error) => {
      handleNotionError(error, {
        toastTitle: 'Erreur de mise à jour',
        toastDescription: 'Impossible de mettre à jour le projet'
      });
    }
  });
}

/**
 * Hook pour supprimer un projet
 */
export function useDeleteNotionProject() {
  const queryClient = useQueryClient();
  const { handleNotionError } = useNotionErrorHandler();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await projectService.deleteProject(id);
      
      if (!response.success) {
        throw new Error(response.error?.message || `Erreur lors de la suppression du projet ${id}`);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet supprimé avec succès');
    },
    onError: (error) => {
      handleNotionError(error, {
        toastTitle: 'Erreur de suppression',
        toastDescription: 'Impossible de supprimer le projet'
      });
    }
  });
}
