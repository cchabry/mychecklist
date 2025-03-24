
import { mockData } from '@/lib/mockData/index';
import { SamplePage } from '@/lib/types';

// Vérifier si les fonctions sont déjà définies
// Pour les pages d'échantillon
if (!mockData.getProjectPages) {
  mockData.getProjectPages = (projectId: string) => {
    return mockData.pages.filter(page => page.projectId === projectId);
  };
}

if (!mockData.createSamplePage) {
  mockData.createSamplePage = (data: Omit<SamplePage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPage: SamplePage = {
      id: `page_${Date.now()}`,
      ...data,
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
