
import { 
  Project, Audit, ChecklistItem, Exigence, 
  SamplePage, Evaluation, CorrectiveAction, ActionProgress,
  ComplianceStatus, ImportanceLevel, ActionStatus, ActionPriority 
} from '@/lib/types';

// Mock projects data
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Site corporate',
    url: 'https://www.example.com',
    description: 'Site vitrine de l\'entreprise',
    status: 'En cours',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-02-20T14:45:00Z',
    progress: 65,
    itemsCount: 42,
    pagesCount: 5
  },
  {
    id: 'project-2',
    name: 'Application mobile',
    url: 'https://app.example.com',
    description: 'Application pour les utilisateurs mobiles',
    status: 'Planifié',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-03-15T16:20:00Z',
    progress: 25,
    itemsCount: 38,
    pagesCount: 3
  }
];

// Mock audits data
export const mockAudits: Audit[] = [
  {
    id: 'audit-1',
    name: 'Audit initial',
    projectId: 'project-1',
    createdAt: '2023-02-10T11:30:00Z',
    updatedAt: '2023-02-15T16:45:00Z'
  },
  {
    id: 'audit-2',
    name: 'Audit de suivi',
    projectId: 'project-1',
    createdAt: '2023-03-25T10:00:00Z',
    updatedAt: '2023-03-28T14:30:00Z'
  }
];

// Mock checklist items
export const mockChecklist: ChecklistItem[] = [
  {
    id: 'item-1',
    title: 'Images accessibles',
    description: 'Toutes les images doivent avoir un attribut alt',
    category: 'Accessibilité',
    subcategory: 'Images',
    reference: ['RGAA 1.1', 'WCAG 2.1'],
    profile: ['Développeur', 'Intégrateur'],
    phase: ['Développement', 'Recette'],
    effort: 'low',
    priority: 'high'
  },
  {
    id: 'item-2',
    title: 'Contraste des textes',
    description: 'Les textes doivent avoir un contraste suffisant avec le fond',
    category: 'Accessibilité',
    subcategory: 'Contrastes',
    reference: ['RGAA 3.3', 'WCAG 2.1'],
    profile: ['Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 'medium',
    priority: 'high'
  },
  {
    id: 'item-3',
    title: 'Optimisation des images',
    description: 'Les images doivent être optimisées pour le web',
    category: 'Performance',
    subcategory: 'Images',
    reference: ['RGESN 1.2'],
    profile: ['Développeur', 'Designer'],
    phase: ['Développement'],
    effort: 'medium',
    priority: 'medium'
  }
];

// Mock exigences data
export const mockExigences: Exigence[] = [
  {
    id: 'exigence-1',
    projectId: 'project-1',
    itemId: 'item-1',
    importance: ImportanceLevel.Major,
    comment: 'Critique pour l\'accessibilité du site'
  },
  {
    id: 'exigence-2',
    projectId: 'project-1',
    itemId: 'item-2',
    importance: ImportanceLevel.Medium,
    comment: 'Important pour la lisibilité'
  },
  {
    id: 'exigence-3',
    projectId: 'project-1',
    itemId: 'item-3',
    importance: ImportanceLevel.Major,
    comment: 'Nécessaire pour la performance'
  }
];

// Mock sample pages data
export const mockPages: SamplePage[] = [
  {
    id: 'page-1',
    projectId: 'project-1',
    url: 'https://www.example.com',
    title: 'Page d\'accueil',
    description: 'Page principale du site',
    order: 0
  },
  {
    id: 'page-2',
    projectId: 'project-1',
    url: 'https://www.example.com/services',
    title: 'Services',
    description: 'Présentation des services',
    order: 1
  },
  {
    id: 'page-3',
    projectId: 'project-1',
    url: 'https://www.example.com/contact',
    title: 'Contact',
    description: 'Formulaire de contact',
    order: 2
  }
];

// Mock evaluations data
export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval-1',
    auditId: 'audit-1',
    pageId: 'page-1',
    exigenceId: 'exigence-1',
    score: ComplianceStatus.Compliant,
    comment: 'Toutes les images ont des attributs alt',
    attachments: ['capture1.png'],
    createdAt: '2023-02-12T10:30:00Z',
    updatedAt: '2023-02-12T10:30:00Z'
  },
  {
    id: 'eval-2',
    auditId: 'audit-1',
    pageId: 'page-1',
    exigenceId: 'exigence-2',
    score: ComplianceStatus.PartiallyCompliant,
    comment: 'Quelques textes n\'ont pas un contraste suffisant',
    attachments: ['capture2.png', 'capture3.png'],
    createdAt: '2023-02-12T11:15:00Z',
    updatedAt: '2023-02-12T11:15:00Z'
  },
  {
    id: 'eval-3',
    auditId: 'audit-1',
    pageId: 'page-2',
    exigenceId: 'exigence-1',
    score: ComplianceStatus.NonCompliant,
    comment: 'Plusieurs images sans attribut alt',
    attachments: ['capture4.png'],
    createdAt: '2023-02-13T09:45:00Z',
    updatedAt: '2023-02-13T09:45:00Z'
  }
];

// Mock actions data
export const mockActions: CorrectiveAction[] = [
  {
    id: 'action-1',
    evaluationId: 'eval-2',
    pageId: 'page-1',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.Medium,
    dueDate: '2023-03-15',
    responsible: 'Jean Dupont',
    comment: 'Corriger le contraste des textes sur fond clair',
    status: ActionStatus.InProgress,
    progress: [
      {
        id: 'progress-1',
        actionId: 'action-1',
        date: '2023-02-20',
        responsible: 'Jean Dupont',
        comment: 'Correction en cours',
        score: ComplianceStatus.PartiallyCompliant,
        status: ActionStatus.InProgress
      }
    ],
    createdAt: '2023-02-15T14:30:00Z',
    updatedAt: '2023-02-20T11:45:00Z'
  },
  {
    id: 'action-2',
    evaluationId: 'eval-3',
    pageId: 'page-2',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.High,
    dueDate: '2023-03-10',
    responsible: 'Sophie Martin',
    comment: 'Ajouter des attributs alt à toutes les images',
    status: ActionStatus.ToDo,
    progress: [],
    createdAt: '2023-02-16T10:15:00Z',
    updatedAt: '2023-02-16T10:15:00Z'
  }
];

// Export all mock data for direct access
export const mockData = {
  projects: mockProjects,
  audits: mockAudits,
  checklist: mockChecklist,
  exigences: mockExigences,
  pages: mockPages,
  evaluations: mockEvaluations,
  actions: mockActions
};
