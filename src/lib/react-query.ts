
/**
 * Configuration centrale pour React Query
 * 
 * Ce fichier configure et exporte le QueryClient utilisé dans toute l'application
 */

import { QueryClient } from '@tanstack/react-query';

// Configuration avec des options par défaut raisonnables
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
