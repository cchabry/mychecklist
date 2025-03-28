
/**
 * Hook générique pour simplifier les requêtes d'API avec React Query
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { NotionResponse } from '@/services/notion/types';

/**
 * Options pour le hook useGenericQuery
 */
export interface UseGenericQueryOptions<TData, TError = unknown> 
  extends Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
}

/**
 * Hook générique pour les requêtes d'API
 * 
 * @param queryKey Clé de requête pour React Query
 * @param queryFn Fonction de requête qui renvoie une NotionResponse
 * @param options Options de requête supplémentaires
 * @returns Résultat de la requête
 */
export function useGenericQuery<TData, TError = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<NotionResponse<TData>>,
  options?: UseGenericQueryOptions<TData, TError>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      
      if (!response.success) {
        throw response.error || new Error('Erreur inconnue');
      }
      
      return response.data as TData;
    },
    ...options
  });
}

/**
 * Version simplifiée pour les requêtes conditionnelles avec ID
 * 
 * @param baseKey Clé de base pour la requête
 * @param id ID de l'entité (si défini, la requête sera exécutée)
 * @param queryFn Fonction de requête qui renvoie une NotionResponse
 * @param options Options de requête supplémentaires
 * @returns Résultat de la requête
 */
export function useEntityQuery<TData, TError = unknown>(
  baseKey: string,
  id: string | undefined,
  queryFn: (id: string) => Promise<NotionResponse<TData>>,
  options?: UseGenericQueryOptions<TData, TError>
) {
  return useGenericQuery<TData, TError>(
    [baseKey, id],
    async () => {
      if (!id) {
        return { success: false, error: { message: 'ID non défini' } };
      }
      return queryFn(id);
    },
    {
      enabled: !!id,
      ...options
    }
  );
}
