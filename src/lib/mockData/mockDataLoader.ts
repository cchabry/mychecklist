
// Import des données mockées
import { mockData } from './mockData';
import { mockDataExtensions } from './mockDataExtensions';
import { mockData as mockDataWithPages } from './mockDataExtraSamplePages';

// Export une version consolidée qui combine toutes les données et méthodes
export const consolidatedMockData = {
  // Données
  projects: [...mockData.projects],
  audits: [...mockData.audits],
  checklist: [...mockData.checklist],
  pages: [...mockData.pages],
  exigences: [...mockData.exigences],
  evaluations: [...mockData.evaluations],
  actions: [...mockData.actions],
  
  // Méthodes des données de base
  getProjects: mockData.getProjects,
  getProject: mockData.getProject,
  getAudits: mockData.getAudits,
  getAudit: mockData.getAudit,
  getChecklistItems: mockData.getChecklistItems || mockData.checklist,
  getChecklistItem: mockData.getChecklistItem,
  getPages: mockData.getPages,
  getPage: mockData.getPage,
  getProjectPages: mockData.getProjectPages,
  getExigences: mockData.getExigences,
  getExigence: mockData.getExigence,
  getEvaluations: mockData.getEvaluations, 
  getEvaluation: mockData.getEvaluation || ((id) => mockData.evaluations.find(e => e.id === id)),
  getActions: mockData.getActions,
  getAction: mockData.getAction,
  
  // Méthodes CRUD
  createProject: mockData.createProject,
  updateProject: mockData.updateProject,
  createEvaluation: mockData.createEvaluation || ((data) => {
    const now = new Date().toISOString();
    const newEval = {
      id: `eval_${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    mockData.evaluations.push(newEval);
    return newEval;
  }),
  updateEvaluation: mockData.updateEvaluation || ((id, data) => {
    const index = mockData.evaluations.findIndex(e => e.id === id);
    if (index >= 0) {
      mockData.evaluations[index] = {
        ...mockData.evaluations[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockData.evaluations[index];
    }
    return null;
  }),
  deleteEvaluation: mockData.deleteEvaluation || ((id) => {
    const index = mockData.evaluations.findIndex(e => e.id === id);
    if (index >= 0) {
      mockData.evaluations.splice(index, 1);
      return true;
    }
    return false;
  }),
  createAction: mockData.createAction || ((data) => {
    const now = new Date().toISOString();
    const newAction = {
      id: `action_${Date.now()}`,
      progress: [],
      ...data,
      createdAt: now,
      updatedAt: now
    };
    mockData.actions.push(newAction);
    return newAction;
  }),
  updateAction: mockData.updateAction || ((id, data) => {
    const index = mockData.actions.findIndex(a => a.id === id);
    if (index >= 0) {
      mockData.actions[index] = {
        ...mockData.actions[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockData.actions[index];
    }
    return null;
  }),
  deleteAction: mockData.deleteAction || ((id) => {
    const index = mockData.actions.findIndex(a => a.id === id);
    if (index >= 0) {
      mockData.actions.splice(index, 1);
      return true;
    }
    return false;
  }),
  
  // Méthodes pour les pages d'échantillon
  createSamplePage: mockData.createSamplePage,
  updateSamplePage: mockData.updateSamplePage,
  deleteSamplePage: mockData.deleteSamplePage,
  
  // Méthodes supplémentaires des extensions
  ...(mockDataExtensions || {}),
  
  // Méthodes historiques
  createNewAudit: mockData.createNewAudit || ((projectId: string) => ({
    id: `audit_${Date.now()}`,
    name: `Audit ${new Date().toLocaleDateString()}`,
    projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: 0,
    items: [],
    version: '1.0'
  })),
  
  // Fonctions d'historique mock
  getMockAuditHistory: (projectId: string) => {
    return mockData.audits.filter(audit => audit.projectId === projectId);
  },
  
  getMockActionHistory: (evaluationId: string) => {
    return mockData.actions.filter(action => action.evaluationId === evaluationId);
  }
};

export default consolidatedMockData;
