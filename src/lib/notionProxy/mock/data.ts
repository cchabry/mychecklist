
/**
 * Données mockées pour le système notionProxy
 * Ce fichier réexporte les données depuis le module mockData central
 */

import { mockData as centralMockData } from '@/lib/mockData';
import { ImportanceLevel } from '@/lib/types';

// Réexporter toutes les données mockées depuis le module central
export const mockData = {
  // Data
  projects: centralMockData.projects,
  audits: centralMockData.audits,
  checklist: centralMockData.checklist,
  pages: centralMockData.pages,
  exigences: centralMockData.exigences,
  evaluations: centralMockData.evaluations,
  actions: centralMockData.actions,

  // Getters
  getProjects: centralMockData.getProjects,
  getProject: centralMockData.getProject,
  getAudits: centralMockData.getAudits,
  getAudit: centralMockData.getAudit,
  getChecklistItems: centralMockData.getChecklistItems,
  getChecklistItem: centralMockData.getChecklistItem,
  getPages: centralMockData.getPages,
  getPage: centralMockData.getPage,
  getExigences: centralMockData.getExigences,
  getExigence: centralMockData.getExigence,
  getEvaluations: centralMockData.getEvaluations,
  getEvaluation: centralMockData.getEvaluation,
  getActions: centralMockData.getActions,
  getAction: centralMockData.getAction,
  
  // Create/Update/Delete
  createProject: centralMockData.createProject,
  updateProject: centralMockData.updateProject,
  createEvaluation: centralMockData.createEvaluation,
  updateEvaluation: centralMockData.updateEvaluation,
  deleteEvaluation: centralMockData.deleteEvaluation,
  createAction: centralMockData.createAction,
  updateAction: centralMockData.updateAction,
  deleteAction: centralMockData.deleteAction,
  
  // Fonction d'aide pour générer des données supplémentaires pour les tests
  generateMockExigence: (projectId: string, itemId: string) => {
    return {
      id: `exigence_${Date.now()}`,
      projectId,
      itemId,
      importance: ImportanceLevel.Medium,
      comment: 'Exigence générée automatiquement'
    };
  }
};

// Exporter aussi les données mockées directement
export { MOCK_PROJECTS } from '@/lib/mockData';
