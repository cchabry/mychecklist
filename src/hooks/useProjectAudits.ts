
import { useState, useEffect } from 'react';
import { Audit, ActionStatus } from '@/types/domain';
import { toast } from 'sonner';
import { useOperationMode } from './useOperationMode';

/**
 * Hook pour récupérer les audits associés à un projet
 */
export const useProjectAudits = (projectId: string) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode } = useOperationMode();

  useEffect(() => {
    // Fonction pour récupérer les audits
    const fetchAudits = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // En mode démo, on génère des données fictives après un court délai
        setTimeout(() => {
          // Générer 0 à 3 audits fictifs
          const count = Math.floor(Math.random() * 4);
          const mockAudits: Audit[] = [];
          
          for (let i = 0; i < count; i++) {
            const progress = Math.floor(Math.random() * 100);
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            mockAudits.push({
              id: `audit-${projectId}-${i}`,
              projectId,
              name: `Audit ${i + 1}`,
              description: `Description de l'audit ${i + 1}`,
              createdAt: date.toISOString(),
              updatedAt: date.toISOString(),
              progress,
              status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending',
              actionsCount: {
                total: Math.floor(Math.random() * 20),
                [ActionStatus.ToDo]: Math.floor(Math.random() * 10),
                [ActionStatus.InProgress]: Math.floor(Math.random() * 5),
                [ActionStatus.Done]: Math.floor(Math.random() * 5)
              }
            });
          }
          
          setAudits(mockAudits);
          setIsLoading(false);
        }, 500);
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (!isDemoMode) {
          toast.error('Erreur lors du chargement des audits', {
            description: 'Impossible de récupérer les audits pour ce projet.'
          });
        }
        
        setIsLoading(false);
      }
    };
    
    fetchAudits();
  }, [projectId, isDemoMode]);
  
  return { audits, isLoading, error };
};
