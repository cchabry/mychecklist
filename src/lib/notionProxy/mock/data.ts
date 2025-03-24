
import { mockData as originalMockData, getAllProjects, getProjectById, getPageById } from '@/lib/mockData';
import { mockDataExtensions } from '@/lib/mockData/mockDataExtensions';

// Create a merged version with utility functions
const mergedMockData = {
  ...originalMockData,
  ...mockDataExtensions,
  getAllProjects,
  getProjectById,
  getPageById
};

// Export the merged mock data
export { mergedMockData as mockData };
