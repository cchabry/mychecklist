
/**
 * Données mockées pour le système notionProxy
 * Ce fichier réexporte les données depuis le module mockData central
 */

import { 
  MOCK_PROJECTS, 
  getAllProjects,
  getProjectById,
  getPageById,
  mockData as centralMockData
} from '@/lib/mockData/index';
import { mockDataExtensions } from '@/lib/mockData/mockDataExtensions';
import { ImportanceLevel } from '@/lib/types';

// Fusionner les données mockées centrales avec nos extensions
const mergedMockData = { ...centralMockData, ...mockDataExtensions };

// Exporter toutes les données mockées depuis le module central
export const mockData = {
  // Data
  projects: MOCK_PROJECTS,
  audits: mergedMockData.audits || [],
  checklist: mergedMockData.checklist || [],
  pages: mergedMockData.pages || [],
  exigences: mergedMockData.exigences || [],
  evaluations: mergedMockData.evaluations || [],
  actions: mergedMockData.actions || [],

  // Getters
  getProjects: getAllProjects,
  getProject: getProjectById,
  getAudits: () => mergedMockData.audits || [],
  getAudit: (id: string) => mergedMockData.audits?.find(a => a.id === id),
  getChecklistItems: () => mergedMockData.checklist || [],
  getChecklistItem: (id: string) => mergedMockData.checklist?.find(i => i.id === id),
  getPages: () => mergedMockData.pages || [],
  getPage: getPageById,
  getExigences: () => mergedMockData.exigences || [],
  getExigence: (id: string) => mergedMockData.exigences?.find(e => e.id === id),
  getEvaluations: () => mergedMockData.evaluations || [],
  getEvaluation: (id: string) => mergedMockData.evaluations?.find(e => e.id === id),
  getActions: () => mergedMockData.actions || [],
  getAction: (id: string) => mergedMockData.actions?.find(a => a.id === id),
  
  // Create/Update/Delete
  createProject: mergedMockData.createProject || ((data) => ({ ...data, id: `proj_${Date.now()}` })),
  updateProject: (id: string, data: any) => ({...getProjectById(id), ...data}),
  createEvaluation: mergedMockData.createEvaluation || ((data: any) => ({...data, id: `eval_${Date.now()}`})),
  updateEvaluation: mergedMockData.updateEvaluation || ((id: string, data: any) => ({...(mergedMockData.evaluations?.find(e => e.id === id) || {}), ...data})),
  deleteEvaluation: mergedMockData.deleteEvaluation || (() => true),
  createAction: mergedMockData.createAction || ((data: any) => ({...data, id: `action_${Date.now()}`})),
  updateAction: mergedMockData.updateAction || ((id: string, data: any) => ({...(mergedMockData.actions?.find(a => a.id === id) || {}), ...data})),
  deleteAction: mergedMockData.deleteAction || (() => true),
  
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
