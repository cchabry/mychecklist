
import { Project, Audit, Exigence, CorrectiveAction, Evaluation } from '@/lib/types';

// Mock data pour les projets
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Projet Test 1',
    description: 'Description du projet 1',
    client: 'Client 1',
    status: 'En cours',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    url: 'https://example.com/project1',
    progress: 0,
    itemsCount: 0,
    pagesCount: 0
  },
  {
    id: 'project-2',
    name: 'Projet Test 2',
    description: 'Description du projet 2',
    client: 'Client 2',
    status: 'Planifié',
    createdAt: '2023-02-15',
    updatedAt: '2023-02-15',
    url: 'https://example.com/project2',
    progress: 0,
    itemsCount: 0,
    pagesCount: 0
  }
];

// Mock data pour les audits
export const mockAudits: Audit[] = [
  {
    id: 'audit-1',
    projectId: 'project-1',
    name: 'Audit Test 1',
    description: 'Premier audit de test',
    status: 'En cours',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-01'
  },
  {
    id: 'audit-2',
    projectId: 'project-2',
    name: 'Audit Test 2',
    description: 'Second audit de test',
    status: 'Terminé',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-30'
  }
];

// Mock data pour les pages (utilisant SamplePage au lieu de Page)
export const mockPages = [
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
    description: 'Description de l\'exigence 1',
    importance: 'Majeur',
    comment: 'Commentaire sur l\'exigence 1',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-01'
  },
  {
    id: 'exigence-2',
    checklistId: 'checklist-2',
    description: 'Description de l\'exigence 2',
    importance: 'Moyen',
    comment: 'Commentaire sur l\'exigence 2',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  }
];

// Mock data pour les checklists
export const mockChecklists = [
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

// Initialisation des mocks pour les actions et évaluations
export const mockActions: CorrectiveAction[] = [];
export const mockEvaluations: Evaluation[] = [];
