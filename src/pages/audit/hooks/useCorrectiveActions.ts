
import { useState, useCallback } from 'react';
import { 
  CorrectiveAction, 
  ActionPriority, 
  ActionStatus, 
  ComplianceStatus 
} from '@/lib/types';
import { toast } from 'sonner';

export const useCorrectiveActions = (auditId: string) => {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Charger les actions correctives pour un audit spécifique
  const loadActions = useCallback(async () => {
    setLoading(true);
    try {
      // Pour l'instant, on utilise des données mockées internes
      // À terme, ces données viendront de l'API Notion
      const mockActions: CorrectiveAction[] = [
        {
          id: `action-${auditId}-1`,
          evaluationId: `eval-page-1-${auditId}`,
          targetScore: ComplianceStatus.Compliant,
          priority: ActionPriority.Haute,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
          responsible: 'John Doe',
          comment: 'Corriger les problèmes d\'accessibilité des images',
          status: ActionStatus.InProgress
        },
        {
          id: `action-${auditId}-2`,
          evaluationId: `eval-page-2-${auditId}`,
          targetScore: ComplianceStatus.Compliant,
          priority: ActionPriority.Critique,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // -2 jours (en retard)
          responsible: 'Jane Smith',
          comment: 'Ajouter des attributs alt aux images',
          status: ActionStatus.ToDo
        }
      ];
      
      setActions(mockActions);
    } catch (error) {
      console.error('Erreur lors du chargement des actions:', error);
      toast.error('Erreur lors du chargement des actions correctives');
    } finally {
      setLoading(false);
    }
  }, [auditId]);
  
  // Ajouter une nouvelle action corrective
  const addAction = useCallback((newAction: Omit<CorrectiveAction, 'id'>) => {
    const id = `action-${auditId}-${Date.now()}`;
    const createdAction: CorrectiveAction = {
      ...newAction,
      id
    };
    
    setActions(prev => [...prev, createdAction]);
    toast.success('Action corrective ajoutée');
    return createdAction;
  }, [auditId]);
  
  // Mettre à jour une action existante
  const updateAction = useCallback((actionId: string, updates: Partial<CorrectiveAction>) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, ...updates } : action
    ));
    toast.success('Action corrective mise à jour');
  }, []);
  
  // Supprimer une action
  const deleteAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
    toast.success('Action corrective supprimée');
  }, []);
  
  // Obtenir les actions pour une évaluation spécifique
  const getActionsForEvaluation = useCallback((evaluationId: string) => {
    return actions.filter(action => action.evaluationId === evaluationId);
  }, [actions]);
  
  return {
    actions,
    loading,
    loadActions,
    addAction,
    updateAction,
    deleteAction,
    getActionsForEvaluation
  };
};
