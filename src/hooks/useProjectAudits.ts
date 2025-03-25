
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
        console.log(`Récupération des audits pour le projet: ${projectId}`);
        
        // Vérifier si nous avons tous les éléments nécessaires pour la requête Notion
        const apiKey = localStorage.getItem('notion_api_key');
        const dbId = localStorage.getItem('notion_database_id');
        
        if (!apiKey || !dbId) {
          console.log('Configuration Notion incomplète pour récupérer les audits', { projectId });
          
          if (!isDemoMode) {
            // Si nous ne sommes pas en mode démo, afficher un toast
            toast.error('Configuration Notion incomplète', {
              description: 'Certaines données ne seront pas disponibles'
            });
          }
          
          // Utiliser un tableau vide comme fallback
          setAudits([]);
          setIsLoading(false);
          return;
        }
        
        // Si nous sommes en mode démo, utiliser des données simulées
        if (isDemoMode) {
          console.log(`Mode démo actif pour le projet ${projectId}, utilisation de données simulées`);
          
          // Simuler un délai et retourner des données mockées
          setTimeout(() => {
            const mockAudits = Array(Math.floor(Math.random() * 3)).fill(null).map((_, index) => ({
              id: `audit-${projectId}-${index}`,
              projectId,
              name: `Audit ${index + 1}`,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
              score: Math.floor(Math.random() * 100),
              items: [],
              progress: Math.floor(Math.random() * 100),
              itemsCount: Math.floor(Math.random() * 50) + 10,
              actionsCount: {
                total: Math.floor(Math.random() * 20),
                [ActionStatus.ToDo]: Math.floor(Math.random() * 10),
                [ActionStatus.InProgress]: Math.floor(Math.random() * 5),
                [ActionStatus.Done]: Math.floor(Math.random() * 5)
              },
              actions: []
            }));
            
            setAudits(mockAudits);
            setIsLoading(false);
          }, 500);
          return;
        }
        
        // Mode réel - récupérer les audits depuis Notion via la fonction Netlify
        try {
          const fetchedAudits = await notionApi.getAuditsByProject(projectId);
          
          // Enrichir les audits avec les propriétés nécessaires pour les cartes
          const enrichedAudits = fetchedAudits.map(audit => {
            // Créer une action count par défaut si elle n'existe pas
            const defaultActionsCount = {
              total: 0,
              [ActionStatus.ToDo]: 0,
              [ActionStatus.InProgress]: 0,
              [ActionStatus.Done]: 0
            };
            
            // Utiliser des valeurs par défaut si les propriétés sont manquantes
            const actionsFromAudit = audit.actions ? audit.actions : [];
            
            return {
              ...audit,
              // Utiliser le score existant ou calculer une progression simulée
              progress: audit.score !== undefined ? audit.score : Math.floor(Math.random() * 100),
              // Nombre d'items évalués (utiliser la longueur du tableau items s'il existe)
              itemsCount: audit.items?.length || 0,
              // Données d'action pour le plan d'action
              actionsCount: {
                total: actionsFromAudit.length || 0,
                [ActionStatus.ToDo]: actionsFromAudit.filter(a => a.status === ActionStatus.ToDo).length || 0,
                [ActionStatus.InProgress]: actionsFromAudit.filter(a => a.status === ActionStatus.InProgress).length || 0,
                [ActionStatus.Done]: actionsFromAudit.filter(a => a.status === ActionStatus.Done).length || 0
              }
            };
          });
          
          console.log(`${enrichedAudits.length} audits récupérés pour le projet ${projectId}`);
          setAudits(enrichedAudits);
        } catch (notionErr) {
          console.error(`Erreur Notion lors de la récupération des audits`, notionErr);
          
          // Passer en mode démo si une erreur se produit
          enableDemoMode('Erreur lors de la récupération des audits');
          
          // Utiliser un tableau vide comme fallback
          setAudits([]);
          
          // Propager l'erreur pour la gestion d'erreur globale
          throw notionErr;
        }
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error(String(err));
        console.error(`Erreur lors de la récupération des audits pour le projet ${projectId}:`, errorInstance);
        
        setError(errorInstance);
        
        // Ne pas afficher de toast en mode démo
        if (!isDemoMode) {
          toast.error('Erreur lors du chargement des audits', {
            description: 'Impossible de récupérer les audits'
          });
        }
        
        // Utiliser un tableau vide comme fallback
        setAudits([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAudits();
  }, [projectId, isDemoMode, enableDemoMode]);
  
  return { audits, isLoading, error };
}
