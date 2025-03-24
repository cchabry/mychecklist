
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
  getChecklistItems: mockData.getChecklistItems || mockData.getChecklist,
  getChecklistItem: mockData.getChecklistItem,
  getPages: mockData.getPages,
  getPage: mockData.getPage,
  getProjectPages: mockData.getProjectPages,
  getExigences: mockData.getExigences,
  getExigence: mockData.getExigence,
  getEvaluations: mockData.getEvaluations,
  getEvaluation: mockData.getEvaluation || mockData.getEvaluations,
  getActions: mockData.getActions,
  getAction: mockData.getAction,
  
  // Méthodes CRUD
  createProject: mockData.createProject,
  updateProject: mockData.updateProject,
  createEvaluation: mockData.createEvaluation || ((data) => {
    const now = new Date().toISOString();
    return {
      id: `eval_${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }),
  updateEvaluation: mockData.updateEvaluation || ((id, data) => {
    return { id, ...data, updatedAt: new Date().toISOString() };
  }),
  deleteEvaluation: mockData.deleteEvaluation || ((id) => true),
  createAction: mockData.createAction || ((data) => {
    const now = new Date().toISOString();
    return {
      id: `action_${Date.now()}`,
      progress: [],
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }),
  updateAction: mockData.updateAction || ((id, data) => {
    return { id, ...data, updatedAt: new Date().toISOString() };
  }),
  deleteAction: mockData.deleteAction || ((id) => true),
  
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
