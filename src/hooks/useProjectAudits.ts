
import { useState, useEffect } from 'react';
import { Audit } from '@/types/domain';
import { useOperationMode } from '@/hooks/useOperationMode';
import { toast } from 'sonner';

/**
 * Hook pour récupérer les audits liés à un projet
 */
export const useProjectAudits = (projectId: string) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode } = useOperationMode();
  
  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    
    const fetchAudits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // On simulera des données d'audit pour le moment
        // À remplacer par un appel API réel dans les prochains sprints
        const mockAudits: Audit[] = [
          {
            id: `audit-${projectId}-1`,
            projectId: projectId,
            name: 'Audit initial',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 75,
            itemsCount: 20
          },
          {
            id: `audit-${projectId}-2`,
            projectId: projectId,
            name: 'Audit de conformité',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 30,
            itemsCount: 15
          }
        ];
        
        // On attendra un peu pour simuler le chargement
        setTimeout(() => {
          setAudits(mockAudits);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error(`Erreur lors de la récupération des audits pour le projet ${projectId}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Ne pas afficher de toast en mode démo
        if (!isDemoMode) {
          toast.error('Erreur lors du chargement des audits', {
            description: 'Impossible de récupérer les audits'
          });
        }
        setIsLoading(false);
      }
    };
    
    fetchAudits();
  }, [projectId, isDemoMode]);
  
  return { audits, isLoading, error };
};
