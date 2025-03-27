
/**
 * Hook pour accéder à un audit par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { getAuditById } from '..';

export function useAuditById(id?: string) {
  return useQuery({
    queryKey: ['audit', id],
    queryFn: async () => {
      if (!id) return null;
      return await getAuditById(id);
    },
    enabled: !!id
  });
}
