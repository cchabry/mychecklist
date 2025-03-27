
/**
 * Hook pour accéder à tous les audits
 */

import { useQuery } from '@tanstack/react-query';
import { getProjectAudits } from '..';

export function useAudits(projectId?: string) {
  return useQuery({
    queryKey: ['audits', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return await getProjectAudits(projectId);
    },
    enabled: !!projectId
  });
}
