
import { v4 as uuidv4 } from 'uuid';
import { Audit } from '@/lib/types';
import { handleDemoMode } from './baseService';
import { mockAudits } from '@/lib/mockData/index';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

class AuditsService {
  async getAll(): Promise<Audit[]> {
    return handleDemoMode<Audit[]>(
      async () => {
        try {
          // Vérifier si la base de données des audits est configurée
          const auditsDbId = localStorage.getItem('notion_audits_database_id');
          if (!auditsDbId) {
            console.warn('Base de données des audits non configurée, utilisation des données de démonstration');
            return mockAudits || [];
          }
          
          // Utiliser l'API Notion via proxy
          const audits = await notionApi.audits.getAudits();
          return audits;
        } catch (error) {
          console.error('Erreur lors de la récupération des audits:', error);
          // En cas d'erreur, utiliser les données mockées comme fallback
          return mockAudits || [];
        }
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockAudits || [];
      }
    );
  }

  async getById(id: string): Promise<Audit | null> {
    return handleDemoMode<Audit | null>(
      async () => {
        try {
          // Vérifier si la base de données des audits est configurée
          const auditsDbId = localStorage.getItem('notion_audits_database_id');
          if (!auditsDbId) {
            console.warn('Base de données des audits non configurée, utilisation des données de démonstration');
            return mockAudits.find(audit => audit.id === id) || null;
          }
          
          // Utiliser l'API Notion via proxy
          const audit = await notionApi.audits.getAudit(id);
          return audit;
        } catch (error) {
          console.error(`Erreur lors de la récupération de l'audit ${id}:`, error);
          // En cas d'erreur, utiliser les données mockées comme fallback
          return mockAudits.find(audit => audit.id === id) || null;
        }
      },
      async () => {
        // Utiliser des données mockées en mode démo
        return mockAudits.find(audit => audit.id === id) || null;
      }
    );
  }

  async create(data: Partial<Audit>): Promise<Audit> {
    console.log('AuditsService.create - Début avec mode:', operationMode.isDemoMode ? 'démo' : 'réel');
    return handleDemoMode<Audit>(
      async () => {
        try {
          console.log('AuditsService.create - Mode réel - Tentative de création via Notion');
          // Vérifier si la base de données des audits est configurée
          const auditsDbId = localStorage.getItem('notion_audits_database_id');
          if (!auditsDbId) {
            console.warn('Base de données des audits non configurée, création en mode démonstration');
            // Créer un nouvel audit mocké
            const newMockAudit = this.createMockAudit(data);
            return newMockAudit;
          }
          
          // Utiliser l'API Notion via proxy
          const newAudit = await notionApi.audits.createAudit(data);
          console.log('AuditsService.create - Audit créé avec succès:', newAudit);
          return newAudit;
        } catch (error) {
          console.error('Erreur lors de la création de l\'audit:', error);
          
          // Si l'erreur est liée à CORS ou à une configuration manquante, créer un mock
          if (error.message?.includes('Failed to fetch') || 
              error.message?.includes('Configuration') ||
              error.message?.includes('CORS')) {
            console.log('Fallback en mode démonstration suite à une erreur');
            return this.createMockAudit(data);
          }
          
          // Sinon propager l'erreur
          throw error;
        }
      },
      async () => {
        console.log('AuditsService.create - Mode démo - Création d\'un audit mocké');
        // Créer un nouvel audit mocké en mode démo
        return this.createMockAudit(data);
      }
    );
  }

  private createMockAudit(data: Partial<Audit>): Audit {
    const newAudit: Audit = {
      id: `audit_${uuidv4()}`,
      projectId: data.projectId || '',
      name: data.name || 'New Audit',
      items: data.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: data.score || 0,
      version: data.version || '1.0'
    };
    
    // Ajouter l'audit aux données mockées pour cohérence
    mockAudits.unshift(newAudit);
    
    return newAudit;
  }

  async update(id: string, data: Partial<Audit>): Promise<Audit> {
    return handleDemoMode<Audit>(
      async () => {
        try {
          // Vérifier si la base de données des audits est configurée
          const auditsDbId = localStorage.getItem('notion_audits_database_id');
          if (!auditsDbId) {
            console.warn('Base de données des audits non configurée, mise à jour en mode démonstration');
            // Mettre à jour un audit mocké
            const audit = mockAudits.find(audit => audit.id === id);
            if (!audit) {
              throw new Error(`Audit with id ${id} not found`);
            }
            
            const updatedAudit = { ...audit, ...data, updatedAt: new Date().toISOString() };
            return updatedAudit;
          }
          
          // Utiliser l'API Notion via proxy
          const updatedAudit = await notionApi.audits.updateAudit(id, data);
          return updatedAudit;
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de l'audit ${id}:`, error);
          
          // Si l'erreur est liée à CORS, utiliser un mock
          if (error.message?.includes('Failed to fetch')) {
            // Mettre à jour un audit mocké comme fallback
            const audit = mockAudits.find(audit => audit.id === id);
            if (!audit) {
              throw new Error(`Audit with id ${id} not found`);
            }
            
            const updatedAudit = { ...audit, ...data, updatedAt: new Date().toISOString() };
            return updatedAudit;
          }
          
          throw error;
        }
      },
      async () => {
        // Mettre à jour un audit mocké en mode démo
        const audit = mockAudits.find(audit => audit.id === id);
        if (!audit) {
          throw new Error(`Audit with id ${id} not found`);
        }
        
        const updatedAudit = { ...audit, ...data, updatedAt: new Date().toISOString() };
        return updatedAudit;
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    return handleDemoMode<boolean>(
      async () => {
        try {
          // Vérifier si la base de données des audits est configurée
          const auditsDbId = localStorage.getItem('notion_audits_database_id');
          if (!auditsDbId) {
            console.warn('Base de données des audits non configurée, suppression en mode démonstration');
            return true;
          }
          
          // Utiliser l'API Notion via proxy
          const success = await notionApi.audits.deleteAudit(id);
          return success;
        } catch (error) {
          console.error(`Erreur lors de la suppression de l'audit ${id}:`, error);
          
          // Si l'erreur est liée à CORS, simuler un succès
          if (error.message?.includes('Failed to fetch')) {
            return true;
          }
          
          throw error;
        }
      },
      async () => {
        // Simuler la suppression en mode démo
        return true;
      }
    );
  }
}

export const auditsService = new AuditsService();
