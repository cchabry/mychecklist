
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';
import { ActionStatus, CorrectiveAction, ActionPriority, ComplianceStatus } from '@/lib/types';

// Actions API endpoints

/**
 * Get all actions
 */
export async function getActions() {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.getActions();
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions');
}

/**
 * Get action by ID
 * @param id Action ID
 */
export async function getAction(id: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.getAction(id);
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions');
}

/**
 * Create a new action
 * @param data Action data
 */
export async function createAction(data: Partial<CorrectiveAction>) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Create default values
    const defaultAction: Partial<CorrectiveAction> = {
      id: `action_${Date.now()}`,
      status: ActionStatus.ToDo,
      priority: ActionPriority.Medium,
      targetScore: ComplianceStatus.Compliant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      responsible: 'Assign responsibility',
      comment: '',
      progress: []
    };
    
    // Merge with provided data
    const newAction = { ...defaultAction, ...data };
    
    // Return action using mock data function if available
    if (mockData.createAction) {
      return mockData.createAction(newAction);
    }
    
    return newAction;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions');
}

/**
 * Update an action
 * @param id Action ID
 * @param data Update data
 */
export async function updateAction(id: string, data: Partial<CorrectiveAction>) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data using the mockData function if available
    if (mockData.updateAction) {
      return mockData.updateAction(id, data);
    }
    
    // Fallback implementation if the mockData function isn't available
    const action = mockData.getAction(id);
    if (!action) {
      throw new Error(`Action ${id} not found`);
    }
    
    const updatedAction = {
      ...action,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return updatedAction;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions');
}

/**
 * Delete an action
 * @param id Action ID
 */
export async function deleteAction(id: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.deleteAction ? mockData.deleteAction(id) : true;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for actions');
}
