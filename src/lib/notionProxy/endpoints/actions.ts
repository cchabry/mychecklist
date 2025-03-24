
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';
import { Action } from '@/lib/types';

// For testing the error handling
const shouldSimulateError = false;

/**
 * Get all corrective actions
 */
export async function getAllActions() {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Optionally simulate an error for testing
    if (shouldSimulateError) {
      throw new Error('Simulated error in getAllActions');
    }
    
    // Return mock data
    return mockData.actions;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions');
}

/**
 * Get actions for a specific evaluation
 * @param evaluationId Evaluation ID
 */
export async function getActionsByEvaluation(evaluationId: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.actions.filter(action => action.evaluationId === evaluationId);
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions by evaluation');
}

/**
 * Get actions for a specific audit
 * @param auditId Audit ID
 */
export async function getActionsByAudit(auditId: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Filter actions based on evaluations that belong to this audit
    const evaluationsForAudit = mockData.evaluations.filter(eval => eval.auditId === auditId);
    const evaluationIds = evaluationsForAudit.map(eval => eval.id);
    
    return mockData.actions.filter(action => 
      evaluationIds.includes(action.evaluationId)
    );
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions by audit');
}

/**
 * Get a specific action by ID
 * @param actionId Action ID
 */
export async function getAction(actionId: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Find the action
    const action = mockData.actions.find(action => action.id === actionId);
    
    if (!action) {
      throw new Error(`Action with ID ${actionId} not found`);
    }
    
    return action;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for specific action');
}

/**
 * Create a new corrective action
 * @param data Action data
 */
export async function createAction(data: Partial<Action>) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Create a new action
    const newAction: Action = {
      id: `action_${Date.now()}`,
      evaluationId: data.evaluationId || '',
      targetScore: data.targetScore || 'Conforme',
      priority: data.priority || 'Moyenne',
      dueDate: data.dueDate || new Date().toISOString(),
      responsible: data.responsible || 'Non assigné',
      comment: data.comment || '',
      status: data.status || 'À faire',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock data
    mockData.actions.push(newAction);
    
    return newAction;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for action creation');
}

/**
 * Update an existing corrective action
 * @param actionId Action ID
 * @param data Updated data
 */
export async function updateAction(actionId: string, data: Partial<Action>) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Find the action
    const actionIndex = mockData.actions.findIndex(action => action.id === actionId);
    
    if (actionIndex === -1) {
      throw new Error(`Action with ID ${actionId} not found`);
    }
    
    // Update the action
    const updatedAction = {
      ...mockData.actions[actionIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // Replace in mock data
    mockData.actions[actionIndex] = updatedAction;
    
    return updatedAction;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for action update');
}
