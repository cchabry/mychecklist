
import { mockData as originalMockData } from '@/lib/mockData';
import { mockDataExtensions } from '@/lib/mockData/mockDataExtensions';

// Create a merged version with utility functions
const mergedMockData = {
  ...originalMockData,
  ...mockDataExtensions,
  getAllProjects: originalMockData.getProjects,
  getProjectById: originalMockData.getProject, 
  getPageById: originalMockData.getPage,
  getMockAuditHistory: originalMockData.audits.filter(a => a.projectId),
  getMockActionHistory: originalMockData.actions.filter(a => a.evaluationId)
};

// Export the merged mock data
export { mergedMockData as mockData };
