
import { mockData as originalMockData } from '@/lib/mockData/mockData';
import { mockDataExtensions } from '@/lib/mockData/mockDataExtensions';

// Create a merged version with utility functions
const mergedMockData = {
  ...originalMockData,
  ...mockDataExtensions,
  getAllProjects: () => originalMockData.projects,
  getProjectById: (id: string) => originalMockData.projects.find(p => p.id === id),
  getPageById: (id: string) => originalMockData.pages.find(p => p.id === id)
};

// Export the merged mock data
export { mergedMockData as mockData };
