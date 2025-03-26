
import { v4 as uuidv4 } from 'uuid';
import { Exigence, ImportanceLevel } from '@/lib/types';
import { handleDemoMode } from './baseService';
import { mockData } from '@/lib/mockData/index';

class ExigencesService {
  async getAll(): Promise<Exigence[]> {
    return handleDemoMode<Exigence[]>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch('/api/exigences');
        if (!response.ok) {
          throw new Error('Failed to fetch exigences');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockData.exigences || [];
      }
    );
  }

  async getById(id: string): Promise<Exigence | null> {
    return handleDemoMode<Exigence | null>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch(`/api/exigences/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch exigence');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockData.exigences.find(exigence => exigence.id === id) || null;
      }
    );
  }

  async create(data: Partial<Exigence>): Promise<Exigence> {
    return handleDemoMode<Exigence>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch('/api/exigences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create exigence');
        }
        return response.json();
      },
      async () => {
        // Créer une nouvelle exigence mockée en mode démo
        const newExigence: Exigence = {
          id: `exigence_${uuidv4()}`,
          projectId: data.projectId || '',
          itemId: data.itemId || '',
          importance: data.importance || ImportanceLevel.Moyen,
          comment: data.comment
        };
        
        return newExigence;
      }
    );
  }

  async update(id: string, data: Partial<Exigence>): Promise<Exigence> {
    return handleDemoMode<Exigence>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch(`/api/exigences/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update exigence');
        }
        return response.json();
      },
      async () => {
        // Mettre à jour une exigence mockée en mode démo
        const exigence = mockData.exigences.find(exigence => exigence.id === id);
        if (!exigence) {
          throw new Error(`Exigence with id ${id} not found`);
        }
        
        const updatedExigence = { ...exigence, ...data };
        return updatedExigence;
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    return handleDemoMode<boolean>(
      async () => {
        // Implémentation réelle qui enverrait la requête à l'API
        const response = await fetch(`/api/exigences/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete exigence');
        }
        return true;
      },
      async () => {
        // Simuler la suppression en mode démo
        const exigence = mockData.exigences.find(exigence => exigence.id === id);
        if (!exigence) {
          throw new Error(`Exigence with id ${id} not found`);
        }
        
        return true;
      }
    );
  }
}

export const exigencesService = new ExigencesService();
