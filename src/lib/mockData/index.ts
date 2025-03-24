import { v4 as uuidv4 } from 'uuid';
import { 
  Project, 
  ChecklistItem, 
  Exigence, 
  Audit, 
  SamplePage as Page, 
  Evaluation, 
  CorrectiveAction, 
  ComplianceStatus, 
  ImportanceLevel,
  ActionPriority,
  ActionStatus 
} from '@/lib/types';

// Re-export everything from the main mockData file 
export * from '@/lib/mockData';

// Projets
export const projects: Project[] = [
  {
    id: 'proj_1',
    name: 'Site Web Corporate',
    url: 'https://example.com',
    description: 'Refonte du site web corporate',
    status: 'En cours',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    progress: 60,
    itemsCount: 25,
    pagesCount: 5
  },
  {
    id: 'proj_2',
    name: 'Application mobile',
    url: 'https://m.example.com',
    description: 'Audit de l\'application mobile',
    status: 'Planifié',
    createdAt: '2023-02-18T09:15:00Z',
    updatedAt: '2023-02-18T09:15:00Z',
    progress: 0,
    itemsCount: 18,
    pagesCount: 3
  }
];

// Additional mock data and functions
// Export une structure complète qui correspond à ce qui est attendu
export const mockData = {
  // Re-export base mock data
  projects,
  audits: [],
  checklist: [],
  pages: [],
  exigences: [],
  evaluations: [],
  actions: [],
  
  // Functions
  getProjects: () => projects,
  getProject: (id: string) => projects.find(p => p.id === id),
  getAudits: () => [],
  getAudit: (id: string) => null,
  getChecklistItems: () => [],
  getChecklistItem: (id: string) => null,
  getPages: () => [],
  getPage: (id: string) => null,
  getProjectPages: (projectId: string) => [],
  getExigences: () => [],
  getExigence: (id: string) => null,
  getEvaluations: () => [],
  getEvaluation: (id: string) => null,
  getActions: () => [],
  getAction: (id: string) => null,
  
  createProject: (data: any) => ({...data, id: `proj_${uuidv4()}`}),
  updateProject: (id: string, data: any) => ({...(projects.find(p => p.id === id) || {}), ...data}),
  createEvaluation: (data: any) => ({...data, id: `eval_${uuidv4()}`}),
  updateEvaluation: (id: string, data: any) => ({...data}),
  deleteEvaluation: () => true,
  createAction: (data: any) => ({...data, id: `action_${uuidv4()}`}),
  updateAction: (id: string, data: any) => ({...data}),
  deleteAction: () => true,
  createSamplePage,
  updateSamplePage,
  deleteSamplePage
};

// Functions for sample pages
function createSamplePage(data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  return {
    id: `page_${Date.now()}`,
    ...data,
    createdAt: now,
    updatedAt: now
  };
}

function updateSamplePage(id: string, data: Partial<Page>) {
  return { 
    id, 
    ...data, 
    updatedAt: new Date().toISOString() 
  };
}

function deleteSamplePage(id: string) {
  return { success: true };
}
