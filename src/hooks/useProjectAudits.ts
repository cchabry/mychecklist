
import { useState, useEffect } from 'react';
import { Audit, ActionStatus } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook pour récupérer et enrichir les audits associés à un projet
 * avec une meilleure gestion des erreurs
 */
export function useProjectAudits(projectId: string) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode, enableDemoMode } = useOperationMode();
  
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
        
        // Tentative de récupération des audits avec gestion de délai
        const fetchPromise = notionApi.getAuditsByProject(projectId);
        
        // Timeout de 10 secondes pour éviter les attentes trop longues
        const timeoutPromise = new Promise<Audit[]>((_, reject) => {
          setTimeout(() => reject(new Error('Délai dépassé lors de la récupération des audits')), 10000);
        });
        
        // Course entre la récupération et le timeout
        const fetchedAudits = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Enrichir les audits avec les propriétés nécessaires pour les cartes
        const enrichedAudits = fetchedAudits.map(audit => ({
          ...audit,
          // Utiliser le score existant ou calculer une progression simulée
          progress: audit.score !== undefined ? audit.score : Math.floor(Math.random() * 100),
          // Nombre d'items évalués (utiliser la longueur du tableau items s'il existe)
          itemsCount: audit.items?.length || 0,
          // Données d'action pour le plan d'action
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
        
        // Générer des données de démo en cas d'erreur
        if (!isDemoMode) {
          console.log('⚠️ Génération de données de démo pour les audits suite à une erreur');
          
          // Activer le mode démo automatiquement après 3 essais infructueux
          const errorCount = parseInt(localStorage.getItem('audit_error_count') || '0') + 1;
          localStorage.setItem('audit_error_count', errorCount.toString());
          
          if (errorCount >= 3) {
            toast.error('Activation du mode démo', {
              description: 'Trop d\'erreurs lors de la connexion à Notion. Mode démo activé automatiquement.'
            });
            enableDemoMode();
          } else {
            // Afficher un message d'erreur standard
            toast.error('Erreur lors du chargement des audits', {
              description: 'Impossible de récupérer les audits. Réessai automatique en cours...'
            });
            
            // Générer des données de démo temporaires
            const demoAudits: Audit[] = [
              {
                id: `demo-audit-${Date.now()}-1`,
                projectId: projectId,
                name: 'Audit initial (démo)',
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                score: 75,
                progress: 75,
                version: '1.0',
                itemsCount: 42,
                actionsCount: {
                  total: 12,
                  [ActionStatus.ToDo]: 5,
                  [ActionStatus.InProgress]: 4,
                  [ActionStatus.Done]: 3
                }
              }
            ];
            
            setAudits(demoAudits);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Procéder au chargement
    fetchAudits();
    
    // Réessayer automatiquement en cas d'échec après 15 secondes
    // sauf si on est en mode démo
    const retryTimer = !isDemoMode ? setTimeout(() => {
      if (error) {
        console.log('🔄 Tentative automatique de récupération des audits');
        fetchAudits();
      }
    }, 15000) : null;
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [projectId, isDemoMode, enableDemoMode]);
  
  return { audits, isLoading, error };
}
