
import { mockData as originalMockData } from './mockData';
import { SamplePage } from '@/lib/types';

// Create a copy of the mock data to avoid modifying the original
const mockData = { ...originalMockData };

// Extend mockData with additional sample pages functions
// Vérifier si les fonctions sont déjà définies
// Pour les pages d'échantillon
if (!mockData.getProjectPages) {
  mockData.getProjectPages = (projectId: string) => {
    return mockData.pages.filter(page => page.projectId === projectId);
  };
}

if (!mockData.createSamplePage) {
  mockData.createSamplePage = (data: Partial<SamplePage>) => {
    const now = new Date().toISOString();
    const newPage: SamplePage = {
      id: `page_${Date.now()}`,
      projectId: data.projectId || '',
      url: data.url || '',
      title: data.title || '',
      description: data.description || '',
      order: data.order || 0,
      createdAt: now,
      updatedAt: now
    };
    mockData.pages.push(newPage);
    return newPage;
  };
}

if (!mockData.updateSamplePage) {
  mockData.updateSamplePage = (id: string, data: Partial<SamplePage>) => {
    const index = mockData.pages.findIndex(p => p.id === id);
    if (index >= 0) {
      mockData.pages[index] = { 
        ...mockData.pages[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      return mockData.pages[index];
    }
    return null;
  };
}

if (!mockData.deleteSamplePage) {
  mockData.deleteSamplePage = (id: string) => {
    const index = mockData.pages.findIndex(p => p.id === id);
    if (index >= 0) {
      const deleted = mockData.pages.splice(index, 1)[0];
      return { success: true, deleted };
    }
    return { success: false };
  };
}

// Ajouter les timestamps manquants aux SamplePages existantes
mockData.pages.forEach(page => {
  if (!page.createdAt) {
    page.createdAt = new Date('2023-01-01').toISOString();
  }
  if (!page.updatedAt) {
    page.updatedAt = new Date('2023-01-01').toISOString();
  }
});

export { mockData };
