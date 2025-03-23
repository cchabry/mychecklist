import { Project, Audit, Page, Exigence, Checklist, Evaluation, CorrectiveAction } from '../lib/types';

// Mock data pour les projets
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Projet Test 1',
    description: 'Description du projet 1',
    client: 'Client A',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'En cours',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: 'project-2',
    name: 'Projet Test 2',
    description: 'Description du projet 2',
    client: 'Client B',
    startDate: '2023-02-15',
    endDate: '2024-03-30',
    status: 'Planifié',
    createdAt: '2023-02-15',
    updatedAt: '2023-02-15'
  }
];

// Mock data pour les audits
export const mockAudits: Audit[] = [
  {
    id: 'audit-1',
    projectId: 'project-1',
    name: 'Audit Test 1',
    description: 'Description de l\'audit 1',
    startDate: '2023-05-01',
    endDate: '2023-05-15',
    status: 'En cours',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-01'
  },
  {
    id: 'audit-2',
    projectId: 'project-2',
    name: 'Audit Test 2',
    description: 'Description de l\'audit 2',
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    status: 'Terminé',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-30'
  }
];

// Mock data pour les pages
export const mockPages: Page[] = [
  {
    id: 'page-1',
    auditId: 'audit-1',
    name: 'Page Test 1',
    url: 'http://example.com/page1',
    description: 'Description de la page 1',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-01'
  },
  {
    id: 'page-2',
    auditId: 'audit-2',
    name: 'Page Test 2',
    url: 'http://example.com/page2',
    description: 'Description de la page 2',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  }
];

// Mock data pour les exigences
export const mockExigences: Exigence[] = [
  {
    id: 'exigence-1',
    checklistId: 'checklist-1',
    name: 'Exigence Test 1',
    description: 'Description de l\'exigence 1',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-01'
  },
  {
    id: 'exigence-2',
    checklistId: 'checklist-2',
    name: 'Exigence Test 2',
    description: 'Description de l\'exigence 2',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  }
];

// Mock data pour les checklists
export const mockChecklists: Checklist[] = [
  {
    id: 'checklist-1',
    name: 'Checklist Test 1',
    description: 'Description de la checklist 1',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-01'
  },
  {
    id: 'checklist-2',
    name: 'Checklist Test 2',
    description: 'Description de la checklist 2',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  }
];

// Ajouter les mocks pour les actions et évaluations
export const mockActions: CorrectiveAction[] = [];
export const mockEvaluations: Evaluation[] = [];
