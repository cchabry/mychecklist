
/**
 * Données mockées pour le système notionProxy
 * Ce fichier réexporte les données depuis le module mockData central
 */

import * as centralMockData from '@/lib/mockData/index';
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
  getAudits: () => centralMockData.audits,
  getAudit: (id: string) => centralMockData.audits.find(a => a.id === id),
  getChecklistItems: () => centralMockData.checklist,
  getChecklistItem: (id: string) => centralMockData.checklist.find(i => i.id === id),
  getPages: () => centralMockData.pages,
  getPage: centralMockData.getPage,
  getExigences: () => centralMockData.exigences,
  getExigence: (id: string) => centralMockData.exigences.find(e => e.id === id),
  getEvaluations: () => centralMockData.evaluations,
  getEvaluation: (id: string) => centralMockData.evaluations.find(e => e.id === id),
  getActions: () => centralMockData.actions,
  getAction: (id: string) => centralMockData.actions.find(a => a.id === id),
  
  // Create/Update/Delete
  createProject: centralMockData.createProject,
  updateProject: (id: string, data: any) => ({...centralMockData.getProject(id), ...data}),
  createEvaluation: (data: any) => ({...data, id: `eval_${Date.now()}`}),
  updateEvaluation: (id: string, data: any) => ({...(centralMockData.evaluations.find(e => e.id === id) || {}), ...data}),
  deleteEvaluation: () => true,
  createAction: (data: any) => ({...data, id: `action_${Date.now()}`}),
  updateAction: (id: string, data: any) => ({...(centralMockData.actions.find(a => a.id === id) || {}), ...data}),
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
