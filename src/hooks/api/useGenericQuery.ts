
/**
 * Hooks génériques pour les requêtes API
 * 
 * Ce fichier fournit des hooks de base pour les requêtes API 
 * qui sont réutilisés par les hooks spécifiques aux entités.
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { NotionResponse } from '@/services/notion/types';
import { toast } from 'sonner';

/**
 * Hook générique pour les requêtes API
 * 
 * @param queryKey Clé de requête React Query
 * @param queryFn Fonction effectuant la requête API
 * @param options Options supplémentaires pour useQuery
 * @returns Résultat de useQuery
 */
export function useGenericQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<NotionResponse<T>>,
  options?: Omit<UseQueryOptions<T, Error, T, unknown[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      if (!response.success) {
        throw new Error(response.error?.message || 'Erreur lors de la requête');
      }
      return response.data as T;
    },
    ...options
  });
}

/**
 * Hook pour les requêtes d'entité par ID
 * 
 * @param entityName Nom de l'entité (pour les logs et messages)
 * @param id ID de l'entité à récupérer
 * @param queryFn Fonction effectuant la requête API
 * @param options Options supplémentaires pour useQuery
 * @returns Résultat de useQuery
 */
export function useEntityQuery<T>(
  entityName: string,
  id: string | undefined,
  queryFn: (id: string) => Promise<NotionResponse<T>>,
  options?: Omit<UseQueryOptions<T, Error, T, [string, string]>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: [entityName, id],
    queryFn: async () => {
      if (!id) {
        throw new Error(`ID ${entityName} non spécifié`);
      }
      
      const response = await queryFn(id);
      
      if (!response.success) {
        const errorMessage = response.error?.message || `${entityName} non trouvé`;
        
        // Afficher un toast seulement si l'erreur n'est pas "non trouvé"
        if (!errorMessage.includes('non trouvé')) {
          toast.error(`Erreur de chargement`, {
            description: errorMessage
          });
        }
        
        throw new Error(errorMessage);
      }
      
      return response.data as T;
    },
    enabled: !!id,
    ...options
  });
}

// Alias pour la compatibilité avec les implémentations existantes
export { useGenericQuery as useNotionQuery };
export { useEntityQuery as useNotionEntityQuery };
