
/**
 * Hook pour mettre à jour une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { UpdateSamplePageData } from '../types';
import { useSamplePageById } from './useSamplePageById';

/**
 * Hook pour mettre à jour une page d'échantillon
 * 
 * @returns Mutation pour mettre à jour une page
 */
export function useUpdateSamplePage(id: string, projectId: string) {
  const queryClient = useQueryClient();
  const { data: currentPage } = useSamplePageById(id);
  
  return useMutation({
    mutationFn: async (data: UpdateSamplePageData) => {
      if (!currentPage) {
        throw new Error("Page d'échantillon non trouvée");
      }
      
      const updatedPage = {
        ...currentPage,
        ...data,
      };
      
      return await notionApi.updateSamplePage(updatedPage);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePage', id] });
      queryClient.invalidateQueries({ queryKey: ['samplePages', projectId] });
    }
  });
}
