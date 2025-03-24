
import { mockData } from './mockData';
import { mockDataExtensions } from './mockDataExtensions';
import { mockData as mockDataWithPages } from './mockDataExtraSamplePages';
import { consolidatedMockData } from './mockDataLoader';
import { Project, Audit, ChecklistItem, Exigence, Evaluation, CorrectiveAction, SamplePage } from '@/lib/types';

// Export mock data collections
export { 
  mockData, 
  mockDataExtensions, 
  mockDataWithPages, 
  consolidatedMockData 
};

// Expose the audits from mockData for direct import
export const mockAudits = mockData.audits;

// Export utility functions
export const getAllProjects = consolidatedMockData.getProjects;
export const getProjectById = consolidatedMockData.getProject;
export const getPagesByProjectId = consolidatedMockData.getProjectPages;
export const getPageById = consolidatedMockData.getPage;
export const createNewAudit = consolidatedMockData.createNewAudit;
export const getMockAuditHistory = consolidatedMockData.getMockAuditHistory;
export const getMockActionHistory = consolidatedMockData.getMockActionHistory;
export const createSamplePage = consolidatedMockData.createSamplePage;
export const updateSamplePage = consolidatedMockData.updateSamplePage;
export const deleteSamplePage = consolidatedMockData.deleteSamplePage;

// Export default
export default consolidatedMockData;
