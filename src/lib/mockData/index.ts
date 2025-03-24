
import { mockData } from './mockData';
import { mockDataExtensions } from './mockDataExtensions';
import { mockData as mockDataWithPages } from './mockDataExtraSamplePages';
import { Project, Audit, ChecklistItem, Exigence, Evaluation, CorrectiveAction, SamplePage } from '@/lib/types';

// Export mockData and its extensions
export { mockData, mockDataExtensions, mockDataWithPages };

// Re-export functions from mockData.ts
export {
  getMockAuditHistory,
  getMockActionHistory,
  getAllProjects,
  getProjectById,
  getPageById,
  getPagesByProjectId,
  createNewAudit,
  createMockAudit,
  MOCK_PROJECTS,
  CATEGORIES,
  CHECKLIST_ITEMS,
  SAMPLE_PAGES
} from '../mockData';

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
