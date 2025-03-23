
/**
 * Données mockées pour le système notionProxy
 * Ce fichier réexporte les données depuis le module mockData central
 */

import * as centralMockData from '@/lib/mockData';
import { ImportanceLevel } from '@/lib/types';

// Réexporter toutes les données mockées depuis le module central
export const mockData = {
  // Data
  projects: centralMockData.MOCK_PROJECTS,
  audits: centralMockData.mockAudits || [],
  checklist: centralMockData.CHECKLIST_ITEMS,
  pages: centralMockData.SAMPLE_PAGES,
  exigences: centralMockData.mockExigences || [],
  evaluations: centralMockData.mockEvaluations || [],
  actions: centralMockData.mockActions || [],

  // Getters
  getProjects: centralMockData.getAllProjects,
  getProject: centralMockData.getProjectById,
  getAudits: () => centralMockData.mockAudits || [],
  getAudit: (id: string) => (centralMockData.mockAudits || []).find(a => a.id === id),
  getChecklistItems: () => centralMockData.CHECKLIST_ITEMS,
  getChecklistItem: (id: string) => centralMockData.CHECKLIST_ITEMS.find(i => i.id === id),
  getPages: () => centralMockData.SAMPLE_PAGES,
  getPage: centralMockData.getPageById,
  getExigences: () => centralMockData.mockExigences || [],
  getExigence: (id: string) => (centralMockData.mockExigences || []).find(e => e.id === id),
  getEvaluations: () => centralMockData.mockEvaluations || [],
  getEvaluation: (id: string) => (centralMockData.mockEvaluations || []).find(e => e.id === id),
  getActions: () => centralMockData.mockActions || [],
  getAction: (id: string) => (centralMockData.mockActions || []).find(a => a.id === id),
  
  // Create/Update/Delete
  createProject: centralMockData.createNewAudit || ((data: any) => ({...data, id: `proj_${Date.now()}`})),
  updateProject: (id: string, data: any) => ({...centralMockData.getProjectById(id), ...data}),
  createEvaluation: (data: any) => ({...data, id: `eval_${Date.now()}`}),
  updateEvaluation: (id: string, data: any) => ({...((centralMockData.mockEvaluations || []).find(e => e.id === id) || {}), ...data}),
  deleteEvaluation: () => true,
  createAction: (data: any) => ({...data, id: `action_${Date.now()}`}),
  updateAction: (id: string, data: any) => ({...((centralMockData.mockActions || []).find(a => a.id === id) || {}), ...data}),
  deleteAction: () => true,
  
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
