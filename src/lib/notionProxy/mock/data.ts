
import { mockData as originalMockData } from '@/lib/mockData';
import { mockDataExtensions } from '@/lib/mockData/mockDataExtensions';
import { 
  getAllProjects, 
  getProjectById, 
  getPageById,
  getMockAuditHistory,
  getMockActionHistory 
} from '@/lib/mockData/index';

// Create a merged version with utility functions
const mergedMockData = {
  ...originalMockData,
  ...mockDataExtensions,
  getAllProjects,
  getProjectById,
  getPageById,
  getMockAuditHistory,
  getMockActionHistory
};

// Export the merged mock data
export { mergedMockData as mockData };
