
import { mockData } from './mockData';
import { mockDataExtensions } from './mockDataExtensions';
import { mockData as mockDataWithPages } from './mockDataExtraSamplePages';
import { consolidatedMockData } from './mockDataLoader';

// Exporter les mock data
export { 
  mockData, 
  mockDataExtensions, 
  mockDataWithPages, 
  consolidatedMockData 
};

// Exporter les fonctions d'utilitaires
export const getAllProjects = consolidatedMockData.getProjects;
export const getProjectById = consolidatedMockData.getProject;
export const getPagesByProjectId = consolidatedMockData.getProjectPages;
export const getPageById = consolidatedMockData.getPage;
export const createNewAudit = consolidatedMockData.createNewAudit;
export const getMockAuditHistory = consolidatedMockData.getMockAuditHistory;
export const getMockActionHistory = consolidatedMockData.getMockActionHistory;

// Par défaut, exporter la version consolidée
export default consolidatedMockData;
