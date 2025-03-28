
/**
 * Hook pour accéder à une exigence spécifique par son ID
 */

import { useEntityQuery } from '@/hooks/api/useGenericQuery';
import { exigenceService } from '@/services/notion';
import { Exigence } from '@/types/domain';

/**
 * Hook pour récupérer une exigence par son ID
 * 
 * @param id ID de l'exigence
 * @returns Résultat de la requête contenant l'exigence
 */
export function useExigenceById(id: string | undefined) {
  return useEntityQuery<Exigence>(
    'exigence',
    id,
    (exigenceId) => exigenceService.getExigenceById(exigenceId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes de fraîcheur
    }
  );
}
