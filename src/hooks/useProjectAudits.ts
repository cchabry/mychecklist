
import { useState, useEffect } from 'react';
import { Audit, ActionStatus } from '@/types/domain';

/**
 * Hook pour récupérer les audits d'un projet
 */
export function useProjectAudits(projectId: string) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    
    const fetchAudits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulation d'un délai réseau
        setTimeout(() => {
          // Données fictives d'audits
          const mockAudits: Audit[] = [
            {
              id: `audit-${projectId}-1`,
              projectId,
              name: "Audit initial",
              description: "Premier audit de conformité du site",
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: "completed",
              progress: 100,
              actionsCount: {
                total: 5,
                [ActionStatus.ToDo]: 0,
                [ActionStatus.InProgress]: 1,
                [ActionStatus.Done]: 4,
                [ActionStatus.Canceled]: 0
              }
            },
            {
              id: `audit-${projectId}-2`,
              projectId,
              name: "Audit d'accessibilité",
              description: "Vérification spécifique des critères d'accessibilité",
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "in-progress",
              progress: 60,
              actionsCount: {
                total: 8,
                [ActionStatus.ToDo]: 3,
                [ActionStatus.InProgress]: 3,
                [ActionStatus.Done]: 2,
                [ActionStatus.Canceled]: 0
              }
            }
          ];

          // Pour avoir un nombre d'audits cohérent selon les projets
          const projectNumber = parseInt(projectId.replace(/\D/g, '')) || 1;
          if (projectNumber === 3) {
            mockAudits.pop(); // Le projet 3 n'a qu'un audit
          } else if (projectNumber === 4) {
            mockAudits.push({
              id: `audit-${projectId}-3`,
              projectId,
              name: "Audit de performance",
              description: "Analyse des temps de chargement et optimisations",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: "planned",
              progress: 15,
              actionsCount: {
                total: 3,
                [ActionStatus.ToDo]: 3,
                [ActionStatus.InProgress]: 0,
                [ActionStatus.Done]: 0,
                [ActionStatus.Canceled]: 0
              }
            });
          } else if (projectNumber === 5) {
            // Le projet 5 n'a pas d'audits
            mockAudits.length = 0;
          }
          
          setAudits(mockAudits);
          setIsLoading(false);
        }, 600);
        
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };
    
    fetchAudits();
  }, [projectId]);
  
  return { audits, isLoading, error };
}
