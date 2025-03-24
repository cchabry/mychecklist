
import { Project, SamplePage } from '@/lib/types';

export const mockDataExtensions = {
  // Add any additional mock data or functions here
  createSamplePage: (data: Partial<SamplePage>): SamplePage => {
    const now = new Date().toISOString();
    return {
      id: `page_${Date.now()}`,
      projectId: '',
      url: '',
      title: '',
      description: '',
      order: 0,
      createdAt: now,
      updatedAt: now,
      ...data
    };
  },
  
  createProject: (data: Partial<Project>): Project => ({
    id: `proj_${Date.now()}`,
    name: 'New Project',
    url: '',
    description: '',
    status: 'en-cours',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0,
    ...data
  })
};

export default mockDataExtensions;
