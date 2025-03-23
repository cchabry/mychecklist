
import { v4 as uuidv4 } from 'uuid';
import { SamplePage } from '@/lib/types';
import { handleDemoMode } from './baseService';
import * as mockData from '@/lib/mockData';

class PagesService {
  async getAll(): Promise<SamplePage[]> {
    return handleDemoMode<SamplePage[]>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch('/api/pages');
        if (!response.ok) {
          throw new Error('Failed to fetch pages');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockData.SAMPLE_PAGES || [];
      }
    );
  }

  async getById(id: string): Promise<SamplePage | null> {
    return handleDemoMode<SamplePage | null>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch(`/api/pages/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch page');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockData.SAMPLE_PAGES.find(page => page.id === id) || null;
      }
    );
  }

  async create(data: Partial<SamplePage>): Promise<SamplePage> {
    return handleDemoMode<SamplePage>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create page');
        }
        return response.json();
      },
      async () => {
        // Créer une nouvelle page mockée en mode démo
        const newPage: SamplePage = {
          id: `page_${uuidv4()}`,
          projectId: data.projectId || '',
          url: data.url || '',
          title: data.title || 'New Page',
          description: data.description,
          order: data.order || 0
        };
        
        return newPage;
      }
    );
  }

  async update(id: string, data: Partial<SamplePage>): Promise<SamplePage> {
    return handleDemoMode<SamplePage>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch(`/api/pages/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update page');
        }
        return response.json();
      },
      async () => {
        // Mettre à jour une page mockée en mode démo
        const page = mockData.SAMPLE_PAGES.find(page => page.id === id);
        if (!page) {
          throw new Error(`Page with id ${id} not found`);
        }
        
        const updatedPage = { ...page, ...data };
        return updatedPage;
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    return handleDemoMode<boolean>(
      async () => {
        // Implémentation réelle qui enverrait la requête à l'API
        const response = await fetch(`/api/pages/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete page');
        }
        return true;
      },
      async () => {
        // Simuler la suppression en mode démo
        const page = mockData.SAMPLE_PAGES.find(page => page.id === id);
        if (!page) {
          throw new Error(`Page with id ${id} not found`);
        }
        
        return true;
      }
    );
  }
}

export const pagesService = new PagesService();
