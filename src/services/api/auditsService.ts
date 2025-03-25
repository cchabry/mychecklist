
import { v4 as uuidv4 } from 'uuid';
import { Audit } from '@/lib/types';
import { handleDemoMode } from './baseService';
import { mockAudits } from '@/lib/mockData/index';
import { cleanAuditId } from '@/lib/utils';

class AuditsService {
  async getAll(): Promise<Audit[]> {
    return handleDemoMode<Audit[]>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch('/api/audits');
        if (!response.ok) {
          throw new Error('Failed to fetch audits');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockAudits || [];
      }
    );
  }

  async getById(id: string): Promise<Audit | null> {
    // S'assurer que l'ID est nettoyé de tout préfixe
    const cleanId = cleanAuditId(id);
    
    return handleDemoMode<Audit | null>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch(`/api/audits/${cleanId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch audit');
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        // Chercher d'abord avec l'ID original
        let audit = mockAudits.find(audit => audit.id === id);
        // Si non trouvé et que l'ID a été nettoyé, chercher avec l'ID nettoyé
        if (!audit && cleanId !== id) {
          audit = mockAudits.find(audit => audit.id === cleanId);
        }
        return audit || null;
      }
    );
  }

  async create(data: Partial<Audit>): Promise<Audit> {
    console.log('📝 AuditsService.create - Données reçues:', JSON.stringify(data, null, 2));
    
    return handleDemoMode<Audit>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        try {
          console.log('🔍 AuditsService.create - Mode réel, envoi à l\'API');
          const response = await fetch('/api/audits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Échec de création de l\'audit:', errorText);
            throw new Error(`Failed to create audit: ${errorText}`);
          }
          
          const result = await response.json();
          console.log('✅ Audit créé avec succès:', JSON.stringify(result, null, 2));
          return result;
        } catch (error) {
          console.error('❌ Exception lors de la création de l\'audit:', error);
          throw error;
        }
      },
      async () => {
        // Créer un nouvel audit mocké en mode démo, avec un UUID standard
        // pour assurer la cohérence avec l'API Notion
        const id = uuidv4();
        console.log('📝 Création d\'un audit démo avec UUID standard:', id);
        
        const newAudit: Audit = {
          id: id, // UUID standard sans préfixe
          projectId: data.projectId || '',
          name: data.name || 'New Audit',
          items: data.items || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: data.score || 0,
          version: data.version || '1.0'
        };
        
        return newAudit;
      }
    );
  }

  async update(id: string, data: Partial<Audit>): Promise<Audit> {
    // S'assurer que l'ID est nettoyé de tout préfixe
    const cleanId = cleanAuditId(id);
    
    return handleDemoMode<Audit>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch(`/api/audits/${cleanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update audit');
        }
        return response.json();
      },
      async () => {
        // Mettre à jour un audit mocké en mode démo
        const audit = mockAudits.find(audit => audit.id === id || audit.id === cleanId);
        if (!audit) {
          throw new Error(`Audit with id ${id} not found`);
        }
        
        const updatedAudit = { ...audit, ...data, updatedAt: new Date().toISOString() };
        return updatedAudit;
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    // S'assurer que l'ID est nettoyé de tout préfixe
    const cleanId = cleanAuditId(id);
    
    return handleDemoMode<boolean>(
      async () => {
        // Implémentation réelle qui enverrait la requête à l'API
        const response = await fetch(`/api/audits/${cleanId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete audit');
        }
        return true;
      },
      async () => {
        // Simuler la suppression en mode démo
        const audit = mockAudits.find(audit => audit.id === id || audit.id === cleanId);
        if (!audit) {
          throw new Error(`Audit with id ${id} not found`);
        }
        
        return true;
      }
    );
  }
}

export const auditsService = new AuditsService();
