
import { v4 as uuidv4 } from 'uuid';
import { 
  Project, 
  ChecklistItem, 
  Exigence, 
  Audit, 
  SamplePage as Page, 
  Evaluation, 
  CorrectiveAction, 
  ComplianceStatus, 
  ImportanceLevel,
  ActionPriority,
  ActionStatus 
} from '@/lib/types';

// Projets
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Site Web Corporate',
    url: 'https://example.com',
    description: 'Refonte du site web corporate',
    status: 'En cours',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    progress: 60,
    itemsCount: 25,
    pagesCount: 5
  },
  {
    id: 'proj_2',
    name: 'Application mobile',
    url: 'https://m.example.com',
    description: 'Audit de l\'application mobile',
    status: 'Planifié',
    createdAt: '2023-02-18T09:15:00Z',
    updatedAt: '2023-02-18T09:15:00Z',
    progress: 0,
    itemsCount: 18,
    pagesCount: 3
  }
];

// Audits
export const mockAudits: Audit[] = [
  {
    id: 'audit_1',
    name: 'Audit Initial',
    projectId: 'proj_1',
    createdAt: '2023-03-01T08:00:00Z',
    updatedAt: '2023-03-05T16:30:00Z',
    score: 68,
    items: [],
    version: '1.0'
  },
  {
    id: 'audit_2',
    name: 'Audit de suivi',
    projectId: 'proj_1',
    createdAt: '2023-04-10T09:45:00Z',
    updatedAt: '2023-04-12T11:20:00Z',
    score: 82,
    items: [],
    version: '1.1'
  }
];

// Checklist
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'item_1',
    title: 'Images accessibles',
    description: 'Toutes les images doivent avoir un texte alternatif',
    category: 'Accessibilité',
    subcategory: 'Images',
    reference: 'RGAA 1.1',
    profile: 'Développeur',
    phase: 'Développement',
    effort: 'low',
    priority: 'high',
    status: ComplianceStatus.NotEvaluated
  },
  {
    id: 'item_2',
    title: 'Contraste des textes',
    description: 'Le contraste entre le texte et le fond doit être suffisant',
    category: 'Accessibilité',
    subcategory: 'Couleurs',
    reference: 'RGAA 3.2',
    profile: 'UX Designer',
    phase: 'Conception',
    effort: 'medium',
    priority: 'medium',
    status: ComplianceStatus.NotEvaluated
  },
  {
    id: 'item_3',
    title: 'Formulaires avec étiquettes',
    description: 'Tous les champs de formulaire doivent avoir une étiquette',
    category: 'Accessibilité',
    subcategory: 'Formulaires',
    reference: 'RGAA 11.1',
    profile: 'Développeur',
    phase: 'Développement',
    effort: 'low',
    priority: 'high',
    status: ComplianceStatus.NotEvaluated
  }
];

// Pages d'échantillon
export const SAMPLE_PAGES: Page[] = [
  {
    id: 'page_1',
    projectId: 'proj_1',
    url: 'https://example.com/accueil',
    title: 'Page d\'accueil',
    description: 'Page d\'accueil du site',
    order: 1
  },
  {
    id: 'page_2',
    projectId: 'proj_1',
    url: 'https://example.com/contact',
    title: 'Contact',
    description: 'Formulaire de contact',
    order: 2
  },
  {
    id: 'page_3',
    projectId: 'proj_1',
    url: 'https://example.com/produits',
    title: 'Produits',
    description: 'Liste des produits',
    order: 3
  }
];

// Exigences
export const mockExigences: Exigence[] = [
  {
    id: 'exigence_1',
    projectId: 'proj_1',
    itemId: 'item_1',
    importance: ImportanceLevel.Important,
    comment: 'Très important pour notre audience'
  },
  {
    id: 'exigence_2',
    projectId: 'proj_1',
    itemId: 'item_2',
    importance: ImportanceLevel.Moyen,
    comment: 'À prendre en compte dans la charte graphique'
  },
  {
    id: 'exigence_3',
    projectId: 'proj_1',
    itemId: 'item_3',
    importance: ImportanceLevel.Important,
    comment: 'Essentiel pour l\'accessibilité des formulaires'
  }
];

// Évaluations
export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval_1',
    auditId: 'audit_1',
    pageId: 'page_1',
    exigenceId: 'exigence_1',
    score: ComplianceStatus.NonCompliant,
    comment: 'Plusieurs images sans texte alternatif',
    attachments: [],
    createdAt: '2023-03-02T10:15:00Z',
    updatedAt: '2023-03-02T10:15:00Z'
  },
  {
    id: 'eval_2',
    auditId: 'audit_1',
    pageId: 'page_2',
    exigenceId: 'exigence_3',
    score: ComplianceStatus.PartiallyCompliant,
    comment: 'Quelques champs de formulaire sans étiquette',
    attachments: [],
    createdAt: '2023-03-03T14:20:00Z',
    updatedAt: '2023-03-03T14:20:00Z'
  }
];

// Actions correctives
export const mockActions: CorrectiveAction[] = [
  {
    id: 'action_1',
    evaluationId: 'eval_1',
    pageId: 'page_1',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.High,
    dueDate: '2023-04-15T00:00:00Z',
    responsible: 'Jean Dupont',
    comment: 'Ajouter des textes alternatifs à toutes les images',
    status: ActionStatus.InProgress,
    progress: [],
    createdAt: '2023-03-05T09:30:00Z',
    updatedAt: '2023-03-10T11:45:00Z'
  },
  {
    id: 'action_2',
    evaluationId: 'eval_2',
    pageId: 'page_2',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.Medium,
    dueDate: '2023-04-30T00:00:00Z',
    responsible: 'Marie Martin',
    comment: 'Ajouter des étiquettes aux champs de formulaire',
    status: ActionStatus.ToDo,
    progress: [],
    createdAt: '2023-03-06T10:00:00Z',
    updatedAt: '2023-03-06T10:00:00Z'
  }
];

// Fonctions utilitaires
export const getAllProjects = () => MOCK_PROJECTS;
export const getProjectById = (id: string) => MOCK_PROJECTS.find(p => p.id === id);
export const getPageById = (id: string) => SAMPLE_PAGES.find(p => p.id === id);
export const createNewAudit = (projectId: string) => ({
  id: `audit_${Date.now()}`,
  name: `Audit ${new Date().toLocaleDateString()}`,
  projectId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  score: 0,
  items: [],
  version: '1.0'
});

// Export une structure complète qui correspond à ce qui est attendu
export const mockData = {
  projects: MOCK_PROJECTS,
  audits: mockAudits,
  checklist: CHECKLIST_ITEMS,
  pages: SAMPLE_PAGES,
  exigences: mockExigences,
  evaluations: mockEvaluations,
  actions: mockActions,
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
  getAction: (id: string) => mockActions.find(a => a.id === a),
  createProject: (data: any) => ({...data, id: `proj_${uuidv4()}`}),
  updateProject: (id: string, data: any) => ({...getProjectById(id), ...data}),
  createEvaluation: (data: any) => ({...data, id: `eval_${uuidv4()}`}),
  updateEvaluation: (id: string, data: any) => ({...mockEvaluations.find(e => e.id === id), ...data}),
  deleteEvaluation: () => true,
  createAction: (data: any) => ({...data, id: `action_${uuidv4()}`}),
  updateAction: (id: string, data: any) => ({...mockActions.find(a => a.id === id), ...data}),
  deleteAction: () => true
};
