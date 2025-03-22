
/**
 * Données mock pour les tests et développement
 */

import { 
  Audit, 
  Project, 
  ChecklistItem, 
  Exigence, 
  SamplePage, 
  Evaluation, 
  CorrectiveAction,
  ActionStatus,
  ActionPriority,
  ComplianceStatus
} from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Audit mock data
const mockAudits: Audit[] = [];
const mockProjects: Project[] = [];
const mockChecklistItems: ChecklistItem[] = [];
const mockExigences: Exigence[] = [];
const mockSamplePages: SamplePage[] = [];
const mockEvaluations: Evaluation[] = [];
const mockActions: CorrectiveAction[] = [];

/**
 * Générateur de réponses mock pour l'API Notion
 */
export const mockData = {
  // Autres méthodes mock
  getMockData: (endpoint: string, method: string, body: any, scenario: string = 'standard') => {
    // Simuler une réponse de base
    return {
      id: `mock-id-${Date.now()}`,
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
      object: 'mock',
      mock: true,
      message: 'Réponse simulée'
    };
  },

  // Projects
  getProjects: () => mockProjects,
  getProject: (id: string) => mockProjects.find(p => p.id === id) || null,
  createProject: (data: Partial<Project>) => {
    const newProject: Project = {
      id: uuidv4(),
      name: data.name || 'Nouveau projet',
      url: data.url || 'https://example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      itemsCount: 0,
      pagesCount: 0,
      ...data
    };
    mockProjects.push(newProject);
    return newProject;
  },
  updateProject: (id: string, data: Partial<Project>) => {
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;
    
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockProjects[projectIndex];
  },
  deleteProject: (id: string) => {
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) return false;
    
    mockProjects.splice(projectIndex, 1);
    return true;
  },

  // Evaluations
  getEvaluations: () => mockEvaluations,
  getEvaluation: (id: string) => mockEvaluations.find(e => e.id === id) || null,
  createEvaluation: (data: Partial<Evaluation>) => {
    const now = new Date().toISOString();
    const newEvaluation: Evaluation = {
      id: uuidv4(),
      auditId: data.auditId || '',
      pageId: data.pageId || '',
      exigenceId: data.exigenceId || '',
      score: data.score || ComplianceStatus.NotEvaluated,
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now
    };
    mockEvaluations.push(newEvaluation);
    return newEvaluation;
  },
  updateEvaluation: (id: string, data: Partial<Evaluation>) => {
    const evalIndex = mockEvaluations.findIndex(e => e.id === id);
    if (evalIndex === -1) return null;
    
    mockEvaluations[evalIndex] = {
      ...mockEvaluations[evalIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockEvaluations[evalIndex];
  },
  deleteEvaluation: (id: string) => {
    const evalIndex = mockEvaluations.findIndex(e => e.id === id);
    if (evalIndex === -1) return false;
    
    mockEvaluations.splice(evalIndex, 1);
    return true;
  },

  // Actions correctives
  getActions: () => mockActions,
  getAction: (id: string) => mockActions.find(a => a.id === id) || null,
  createAction: (data: Partial<CorrectiveAction>) => {
    const now = new Date().toISOString();
    const newAction: CorrectiveAction = {
      id: uuidv4(),
      evaluationId: data.evaluationId || '',
      pageId: data.pageId || '', // Ajout de pageId manquant
      targetScore: data.targetScore || ComplianceStatus.Compliant,
      priority: data.priority || ActionPriority.Medium,
      dueDate: data.dueDate || '',
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status || ActionStatus.ToDo,
      progress: data.progress || [], // Correction: doit être un tableau vide par défaut
      createdAt: now,
      updatedAt: now
    };
    mockActions.push(newAction);
    return newAction;
  },
  updateAction: (id: string, data: Partial<CorrectiveAction>) => {
    const actionIndex = mockActions.findIndex(a => a.id === id);
    if (actionIndex === -1) return null;
    
    mockActions[actionIndex] = {
      ...mockActions[actionIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockActions[actionIndex];
  },
  deleteAction: (id: string) => {
    const actionIndex = mockActions.findIndex(a => a.id === id);
    if (actionIndex === -1) return false;
    
    mockActions.splice(actionIndex, 1);
    return true;
  }
};

/**
 * Fonction pour générer une réponse mock pour une requête Notion
 */
export function mockNotionResponse(endpoint: string, method = 'GET', body: any) {
  return mockData.getMockData(endpoint, method, body);
}
