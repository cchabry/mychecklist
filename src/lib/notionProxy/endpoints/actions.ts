
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';
import { CorrectiveAction, ActionStatus, ComplianceStatus, ActionPriority } from '@/lib/types';

/**
 * Get action by ID
 */
export async function getAction(actionId: string) {
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    const action = mockData.actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error('Action not found');
    }
    return action;
  }
  
  throw new Error('Not implemented in real mode yet');
}

/**
 * Get actions for evaluation
 */
export async function getActionsForEvaluation(evaluationId: string) {
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    const actions = mockData.actions.filter(a => a.evaluationId === evaluationId);
    return actions;
  }
  
  throw new Error('Not implemented in real mode yet');
}

/**
 * Create a new action
 */
export async function createAction(action: Partial<CorrectiveAction>) {
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Create a new action with defaults
    const newAction: CorrectiveAction = {
      id: `action_${Date.now()}`,
      evaluationId: action.evaluationId || '',
      targetScore: action.targetScore || ComplianceStatus.Compliant,
      priority: action.priority || ActionPriority.Medium,
      dueDate: action.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      responsible: action.responsible || 'Unassigned',
      comment: action.comment || '',
      status: action.status || ActionStatus.ToDo,
      pageId: action.pageId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: []
    };
    
    // Add to mock data
    mockData.actions.push(newAction);
    
    return newAction;
  }
  
  throw new Error('Not implemented in real mode yet');
}

/**
 * Update action
 */
export async function updateAction(actionId: string, data: Partial<CorrectiveAction>) {
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Find action index
    const actionIndex = mockData.actions.findIndex(a => a.id === actionId);
    if (actionIndex === -1) {
      throw new Error('Action not found');
    }
    
    // Update the action
    const updatedAction = {
      ...mockData.actions[actionIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update in-place
    mockData.actions[actionIndex] = updatedAction;
    
    return updatedAction;
  }
  
  throw new Error('Not implemented in real mode yet');
}

/**
 * Delete action
 */
export async function deleteAction(actionId: string) {
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Find action index
    const actionIndex = mockData.actions.findIndex(a => a.id === actionId);
    if (actionIndex === -1) {
      return false;
    }
    
    // Remove from mock data
    mockData.actions.splice(actionIndex, 1);
    
    return true;
  }
  
  throw new Error('Not implemented in real mode yet');
}
