
import { useState, useEffect } from 'react';
import { Audit, ActionStatus } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook pour récupérer et enrichir les audits associés à un projet
 */
export function useProjectAudits(projectId: string) {
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
        console.log(`🔍 Récupération des audits pour le projet: ${projectId}`);
        const fetchedAudits = await notionApi.getAuditsByProject(projectId);
        
        // Enrichir les audits avec les propriétés nécessaires pour les cartes
        const enrichedAudits = fetchedAudits.map(audit => ({
          ...audit,
          // Utiliser le score existant ou calculer une progression simulée
          progress: audit.score !== undefined ? audit.score : Math.floor(Math.random() * 100),
          // Nombre d'items évalués (utiliser la longueur du tableau items s'il existe)
          itemsCount: audit.items?.length || 0,
          // Données d'action pour le plan d'action (à implémenter dans une future version)
          actionsCount: {
            total: 0,
            [ActionStatus.ToDo]: 0,
            [ActionStatus.InProgress]: 0,
            [ActionStatus.Done]: 0
          }
        }));
        
        console.log(`✅ ${enrichedAudits.length} audits récupérés pour le projet ${projectId}`);
        setAudits(enrichedAudits);
      } catch (err) {
        console.error(`❌ Erreur lors de la récupération des audits pour le projet ${projectId}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Ne pas afficher de toast en mode démo
        if (!isDemoMode) {
          toast.error('Erreur lors du chargement des audits', {
            description: 'Impossible de récupérer les audits depuis Notion'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAudits();
  }, [projectId, isDemoMode]);
  
  return { audits, isLoading, error };
}
