
import { mockData } from '@/lib/mockData';
import { 
  getAllProjects,
  getProjectById,
  getPageById,
  mockDataExtensions 
} from '@/lib/mockData';

// Merge mockData with extensions
const mergedMockData = {
  ...mockData,
  ...mockDataExtensions,
  getAllProjects,
  getProjectById,
  getPageById
};

// Export the merged mock data
export { mergedMockData as mockData };
