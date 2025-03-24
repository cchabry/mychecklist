
import { mockData as originalMockData } from '@/lib/mockData';
import { mockDataExtensions } from '@/lib/mockData/mockDataExtensions';

// Create a merged version with utility functions
const mergedMockData = {
  ...originalMockData,
  ...mockDataExtensions,
  getAllProjects: originalMockData.getAllProjects,
  getProjectById: originalMockData.getProject, 
  getPageById: originalMockData.getPage,
  getMockAuditHistory: originalMockData.getMockAuditHistory,
  getMockActionHistory: originalMockData.getMockActionHistory
};

// Export the merged mock data
export { mergedMockData as mockData };
