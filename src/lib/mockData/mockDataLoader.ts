
// Import tout le mock data
import { mockData } from './index';
import { mockDataExtensions } from './mockDataExtensions';
import { mockData as mockDataWithPages } from './mockDataExtraSamplePages';

// Export une version consolidée
export const consolidatedMockData = {
  ...mockData,
  ...mockDataExtensions,
  ...mockDataWithPages
};

export default consolidatedMockData;
