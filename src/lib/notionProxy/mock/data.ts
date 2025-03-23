
/**
 * Données mockées pour le système notionProxy
 * Ce fichier réexporte les données depuis le module mockData central
 */

import { 
  MOCK_PROJECTS, 
  mockAudits, 
  CHECKLIST_ITEMS, 
  SAMPLE_PAGES,
  mockExigences,
  mockEvaluations,
  mockActions,
  getAllProjects,
  getProjectById,
  getPageById,
  getAction,
  mockData as centralMockData
} from '@/lib/mockData/index';
import { ImportanceLevel } from '@/lib/types';

// Réexporter toutes les données mockées depuis le module central
export const mockData = {
  // Data
  projects: MOCK_PROJECTS,
  audits: mockAudits,
  checklist: CHECKLIST_ITEMS,
  pages: SAMPLE_PAGES,
  exigences: mockExigences,
  evaluations: mockEvaluations,
  actions: mockActions,

  // Getters
  getProjects: getAllProjects,
  getProject: getProjectById,
  getAudits: () => mockAudits,
  getAudit: (id: string) => mockAudits.find(a => a.id === id),
  getChecklistItems: () => CHECKLIST_ITEMS,
  getChecklistItem: (id: string) => CHECKLIST_ITEMS.find(i => i.id === id),
  getPages: () => SAMPLE_PAGES,
  getPage: getPageById,
  getExigences: () => mockExigences,
  getExigence: (id: string) => mockExigences.find(e => e.id === id),
  getEvaluations: () => mockEvaluations,
  getEvaluation: (id: string) => mockEvaluations.find(e => e.id === id),
  getActions: () => mockActions,
  getAction: getAction,
  
  // Create/Update/Delete
  createProject: centralMockData.createProject,
  updateProject: (id: string, data: any) => ({...getProjectById(id), ...data}),
  createEvaluation: (data: any) => ({...data, id: `eval_${Date.now()}`}),
  updateEvaluation: (id: string, data: any) => ({...(mockEvaluations.find(e => e.id === id) || {}), ...data}),
  deleteEvaluation: () => true,
  createAction: (data: any) => ({...data, id: `action_${Date.now()}`}),
  updateAction: (id: string, data: any) => ({...(mockActions.find(a => a.id === id) || {}), ...data}),
  deleteAction: () => true,
  
  // Fonction d'aide pour générer des données supplémentaires pour les tests
  generateMockExigence: (projectId: string, itemId: string) => {
    return {
      id: `exigence_${Date.now()}`,
      projectId,
      itemId,
      importance: ImportanceLevel.Moyen,
      comment: 'Exigence générée automatiquement'
    };
  }
};

// Exporter aussi les données mockées directement
export { MOCK_PROJECTS } from '@/lib/mockData/index';
