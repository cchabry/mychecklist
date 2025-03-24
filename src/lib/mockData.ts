
// Import les données mockées depuis les différents fichiers
import { mockProjects } from './mockData/mockDataProjects';
import { mockChecklist } from './mockData/mockDataChecklist';
import { mockAudits } from './mockData/mockDataAudits';
import { mockSamplePages } from './mockData/mockDataSamplePages';
import { mockExigences } from './mockData/mockDataExigences';
import { mockEvaluations } from './mockData/mockDataEvaluations';
import { mockActions } from './mockData/mockDataActions';

// Consolidation de toutes les données mocks
export const consolidatedMockData = {
  // Données de base
  projects: mockProjects,
  checklist: mockChecklist,
  samplePages: mockSamplePages,
  audits: mockAudits,
  exigences: mockExigences,
  evaluations: mockEvaluations,
  actions: mockActions,
  
  // Méthodes d'accès
  getAllProjects: () => mockProjects,
  getProjectById: (id: string) => mockProjects.find(project => project.id === id),
  
  // Méthodes d'accès aux pages d'échantillon
  getAllSamplePages: () => mockSamplePages,
  getSamplePagesByProjectId: (projectId: string) => 
    mockSamplePages.filter(page => page.projectId === projectId),
  getPageById: (id: string) => 
    mockSamplePages.find(page => page.id === id),
  
  // Méthodes d'accès au référentiel
  getAllChecklistItems: () => mockChecklist,
  getChecklistItem: (id: string) => 
    mockChecklist.find(item => item.id === id),
  
  // Méthodes d'accès aux exigences
  getAllExigences: () => mockExigences,
  getExigencesByProjectId: (projectId: string) => 
    mockExigences.filter(exigence => exigence.projectId === projectId),
  getExigenceById: (id: string) => 
    mockExigences.find(exigence => exigence.id === id),
  
  // Méthodes d'accès aux audits
  getAllAudits: () => mockAudits,
  getAuditsByProjectId: (projectId: string) => 
    mockAudits.filter(audit => audit.projectId === projectId),
  getAuditById: (id: string) => 
    mockAudits.find(audit => audit.id === id),
  
  // Méthodes d'accès aux évaluations
  getEvaluations: (auditId: string) => 
    mockEvaluations.filter(evaluation => evaluation.auditId === auditId),
  getEvaluation: (id: string) => 
    mockEvaluations.find(evaluation => evaluation.id === id),
  
  // Méthodes d'accès aux actions correctives
  getActions: (evaluationId: string) => 
    mockActions.filter(action => action.evaluationId === evaluationId),
  getAction: (id: string) => 
    mockActions.find(action => action.id === id),
  
  // Historiques
  getMockAuditHistory: mockAudits,
  getMockActionHistory: mockActions,
  
  // Méthodes de création
  createNewProject: (name: string) => ({
    id: `proj-${Date.now()}`,
    name,
    url: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0,
    itemsCount: 0,
    pagesCount: 0
  }),
  
  createNewAudit: (projectId: any) => ({
    id: `audit-${Date.now()}`,
    projectId,
    name: `Audit ${new Date().toLocaleDateString()}`,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: 0,
    version: "1.0"
  }),
  
  // Méthodes de création et de mise à jour pour les évaluations
  createEvaluation: (evaluationData: any) => ({
    id: `eval-${Date.now()}`,
    ...evaluationData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  
  updateEvaluation: (id: string, data: any) => {
    const index = mockEvaluations.findIndex(eval => eval.id === id);
    if (index >= 0) {
      mockEvaluations[index] = {
        ...mockEvaluations[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockEvaluations[index];
    }
    return null;
  },
  
  deleteEvaluation: (id: string) => {
    const index = mockEvaluations.findIndex(eval => eval.id === id);
    if (index >= 0) {
      mockEvaluations.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },
  
  // Méthodes de création et de mise à jour pour les actions correctives
  createAction: (actionData: any) => ({
    id: `action-${Date.now()}`,
    ...actionData,
    progress: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  
  updateAction: (id: string, data: any) => {
    const index = mockActions.findIndex(action => action.id === id);
    if (index >= 0) {
      mockActions[index] = {
        ...mockActions[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockActions[index];
    }
    return null;
  },
  
  deleteAction: (id: string) => {
    const index = mockActions.findIndex(action => action.id === id);
    if (index >= 0) {
      mockActions.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },
  
  // Pages de l'échantillon
  createPage: (pageData: any) => {
    const newPage = {
      id: `page-${Date.now()}`,
      ...pageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockSamplePages.push(newPage);
    return newPage;
  },
  
  updatePage: (id: string, data: any) => {
    const index = mockSamplePages.findIndex(page => page.id === id);
    if (index >= 0) {
      mockSamplePages[index] = {
        ...mockSamplePages[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockSamplePages[index];
    }
    return null;
  },
  
  deletePage: (pageId: string) => {
    const index = mockSamplePages.findIndex(page => page.id === pageId);
    if (index >= 0) {
      mockSamplePages.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  }
};

// Pour faciliter l'utilisation dans d'autres modules
export default consolidatedMockData;
