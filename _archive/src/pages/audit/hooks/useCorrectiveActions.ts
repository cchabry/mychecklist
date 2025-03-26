
import { useState, useCallback } from 'react';
import { AuditItem, CorrectiveAction, ActionProgress, ActionPriority, ActionStatus, ComplianceStatus } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export const useCorrectiveActions = (
  item: AuditItem,
  onItemChange: (updatedItem: AuditItem) => void
) => {
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);

  // Ajouter une nouvelle action corrective
  const addAction = useCallback((actionData: Partial<CorrectiveAction>) => {
    const newAction: CorrectiveAction = {
      id: uuidv4(),
      evaluationId: item.id,
      pageId: actionData.pageId || '',
      targetScore: actionData.targetScore || ComplianceStatus.Compliant,
      priority: actionData.priority || ActionPriority.Medium,
      dueDate: actionData.dueDate || new Date().toISOString(),
      responsible: actionData.responsible || '',
      comment: actionData.comment || '',
      status: actionData.status || ActionStatus.ToDo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: []
    };

    const updatedItem = {
      ...item,
      actions: [...(item.actions || []), newAction]
    };

    onItemChange(updatedItem);
    setIsAddingAction(false);
  }, [item, onItemChange]);

  // Mettre à jour une action existante
  const updateAction = useCallback((updatedAction: CorrectiveAction) => {
    if (!item.actions) return;

    const updatedActions = item.actions.map(action => 
      action.id === updatedAction.id 
        ? { ...updatedAction, updatedAt: new Date().toISOString() } 
        : action
    );

    const updatedItem = {
      ...item,
      actions: updatedActions
    };

    onItemChange(updatedItem);
    setEditingAction(null);
  }, [item, onItemChange]);

  // Supprimer une action
  const deleteAction = useCallback((actionId: string) => {
    if (!item.actions) return;

    const updatedActions = item.actions.filter(action => action.id !== actionId);

    const updatedItem = {
      ...item,
      actions: updatedActions
    };

    onItemChange(updatedItem);
  }, [item, onItemChange]);

  // Ajouter un progrès à une action
  const addProgress = useCallback((actionId: string, progressData: { comment: string, responsible: string }) => {
    if (!item.actions) return;

    const updatedActions = item.actions.map(action => {
      if (action.id === actionId) {
        const newProgress: ActionProgress = {
          id: uuidv4(),
          actionId: actionId,
          date: new Date().toISOString(),
          responsible: progressData.responsible,
          comment: progressData.comment,
          score: action.targetScore,
          status: ActionStatus.InProgress
        };

        return {
          ...action,
          progress: [...(action.progress || []), newProgress],
          status: ActionStatus.InProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return action;
    });

    const updatedItem = {
      ...item,
      actions: updatedActions
    };

    onItemChange(updatedItem);
  }, [item, onItemChange]);

  // Compléter une action
  const completeAction = useCallback((actionId: string, comment: string) => {
    if (!item.actions) return;

    const updatedActions = item.actions.map(action => {
      if (action.id === actionId) {
        const newProgress: ActionProgress = {
          id: uuidv4(),
          actionId: actionId,
          date: new Date().toISOString(),
          responsible: action.responsible,
          comment: comment,
          score: action.targetScore,
          status: ActionStatus.Done
        };

        return {
          ...action,
          progress: [...(action.progress || []), newProgress],
          status: ActionStatus.Done,
          updatedAt: new Date().toISOString()
        };
      }
      return action;
    });

    const updatedItem = {
      ...item,
      actions: updatedActions
    };

    onItemChange(updatedItem);
  }, [item, onItemChange]);

  return {
    isAddingAction,
    editingAction,
    setIsAddingAction,
    setEditingAction,
    addAction,
    updateAction,
    deleteAction,
    addProgress,
    completeAction
  };
};

export default useCorrectiveActions;
