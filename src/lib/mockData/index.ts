
import { mockData } from './mockData';
import { mockDataExtensions } from './mockDataExtensions';
import { mockData as mockDataWithPages } from './mockDataExtraSamplePages';
import { Project, Audit, ChecklistItem, Exigence, Evaluation, CorrectiveAction, SamplePage } from '@/lib/types';

// Export mockData and its extensions
export { mockData, mockDataExtensions, mockDataWithPages };

// Export base functions
export const getAllProjects = () => mockData.projects;
export const getProjectById = (id: string) => mockData.projects.find(p => p.id === id);
export const getPageById = (id: string) => mockData.pages.find(p => p.id === id);
export const getMockAuditHistory = (projectId: string) => mockData.audits.filter(a => a.projectId === projectId);
export const getMockActionHistory = (evaluationId: string) => mockData.actions.filter(a => a.evaluationId === evaluationId);
export const getPagesByProjectId = (projectId: string) => mockData.pages.filter(p => p.projectId === projectId);

// Re-export mock data collections
export const MOCK_PROJECTS = mockData.projects;
export const CATEGORIES = Array.from(new Set(mockData.checklist.map(item => item.category)));

// Export type-safe creator functions
export const createMockProject = (data: Partial<Project>): Project => ({
  id: `proj_${Date.now()}`,
  name: 'New Project',
  url: '',
  description: '',
  status: 'en-cours',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  progress: 0,
  ...data
});

export const createMockSamplePage = (data: Partial<SamplePage>): SamplePage => ({
  id: `page_${Date.now()}`,
  projectId: '',
  url: '',
  title: '',
  description: '',
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data
});

// Export by default
export default mockData;
