
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem, ComplianceStatus } from '@/lib/types';
import { handleDemoMode } from './baseService';
import * as mockData from '@/lib/mockData';

class ChecklistService {
  async getAll(filters?: any): Promise<ChecklistItem[]> {
    return handleDemoMode<ChecklistItem[]>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch('/api/checklist');
        if (!response.ok) {
          throw new Error('Failed to fetch checklist');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockData.CHECKLIST_ITEMS || [];
      }
    );
  }

  async getById(id: string): Promise<ChecklistItem | null> {
    return handleDemoMode<ChecklistItem | null>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch(`/api/checklist/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch checklist item');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockData.CHECKLIST_ITEMS.find(item => item.id === id) || null;
      }
    );
  }

  async create(data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    return handleDemoMode<ChecklistItem>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch('/api/checklist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create checklist item');
        }
        return response.json();
      },
      async () => {
        // Créer un nouvel élément mockée en mode démo
        const newItem: ChecklistItem = {
          id: `item_${uuidv4()}`,
          consigne: data.consigne || '',
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          subcategory: data.subcategory || '',
          reference: data.reference || '',
          profile: data.profile || '',
          phase: data.phase || '',
          criteria: data.criteria || '',
          requirementLevel: data.requirementLevel || '',
          scope: data.scope || '',
          effort: data.effort || '',
          priority: data.priority || '',
          status: ComplianceStatus.NotEvaluated
        };
        
        return newItem;
      }
    );
  }

  async update(id: string, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    return handleDemoMode<ChecklistItem>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch(`/api/checklist/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update checklist item');
        }
        return response.json();
      },
      async () => {
        // Mettre à jour un élément mocké en mode démo
        const item = mockData.CHECKLIST_ITEMS.find(item => item.id === id);
        if (!item) {
          throw new Error(`Checklist item with id ${id} not found`);
        }
        
        const updatedItem = { ...item, ...data };
        return updatedItem;
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    return handleDemoMode<boolean>(
      async () => {
        // Implémentation réelle qui enverrait la requête à l'API
        const response = await fetch(`/api/checklist/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete checklist item');
        }
        return true;
      },
      async () => {
        // Simuler la suppression en mode démo
        const item = mockData.CHECKLIST_ITEMS.find(item => item.id === id);
        if (!item) {
          throw new Error(`Checklist item with id ${id} not found`);
        }
        
        return true;
      }
    );
  }
}

export const checklistService = new ChecklistService();
