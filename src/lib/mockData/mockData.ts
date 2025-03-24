
import { Project, Audit, ChecklistItem, Exigence, Evaluation, CorrectiveAction, SamplePage, ComplianceStatus, ImportanceLevel, ActionStatus, ActionPriority } from '@/lib/types';

// Define basic mock data structure
export const mockData = {
  projects: [
    {
      id: 'project-1',
      name: 'Site Corporate TMW',
      url: 'https://www.tmw-agency.com',
      description: 'Refonte du site vitrine de l\'agence',
      status: 'en-cours',
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-01-15T10:30:00Z',
      progress: 65
    },
    {
      id: 'project-2',
      name: 'Application SaaS Fintech',
      url: 'https://app.fintech-example.com',
      description: 'Application de gestion financière pour PME',
      status: 'planifié',
      createdAt: '2023-02-20T14:45:00Z',
      updatedAt: '2023-02-20T14:45:00Z',
      progress: 25
    },
    {
      id: 'project-3',
      name: 'E-commerce Mode Durable',
      url: 'https://eco-fashion.example.com',
      description: 'Boutique en ligne de mode éco-responsable',
      status: 'terminé',
      createdAt: '2022-11-05T09:15:00Z',
      updatedAt: '2023-03-18T16:20:00Z',
      progress: 100
    }
  ],
  
  checklist: [
    {
      id: 'check-1',
      title: 'Images optimisées',
      consigne: 'Optimiser les images',
      description: 'Toutes les images doivent être optimisées pour le web',
      category: 'Médias',
      subcategory: 'Images',
      metaRefs: ['RGESN 4.2', 'OPQUAST 121'],
      profile: ['UI Designer', 'Développeur'],
      phase: ['Conception', 'Développement'],
      effort: 'Moyen',
      priority: 'Important',
      requirementLevel: 'MUST',
      scope: 'Global'
    },
    {
      id: 'check-2',
      title: 'Formulaires accessibles',
      consigne: 'Rendre les formulaires accessibles',
      description: 'Tous les formulaires doivent être accessibles',
      category: 'Accessibilité',
      subcategory: 'Formulaires',
      metaRefs: ['RGAA 11.1', 'OPQUAST 83'],
      profile: ['UX Designer', 'Développeur'],
      phase: ['Conception', 'Développement'],
      effort: 'Important',
      priority: 'Majeur',
      requirementLevel: 'MUST',
      scope: 'Global'
    },
    {
      id: 'check-3',
      title: 'Contraste des textes',
      consigne: 'Assurer un contraste suffisant',
      description: 'Le contraste entre le texte et le fond doit être suffisant',
      category: 'Accessibilité',
      subcategory: 'Lisibilité',
      metaRefs: ['RGAA 3.3', 'OPQUAST 76'],
      profile: ['UI Designer'],
      phase: ['Conception'],
      effort: 'Faible',
      priority: 'Majeur',
      requirementLevel: 'MUST',
      scope: 'Global'
    }
  ],
  
  pages: [
    {
      id: 'page-1',
      projectId: 'project-1',
      url: 'https://www.tmw-agency.com',
      title: 'Page d\'accueil',
      description: 'Page principale du site',
      order: 1,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-01-15T10:30:00Z'
    },
    {
      id: 'page-2',
      projectId: 'project-1',
      url: 'https://www.tmw-agency.com/services',
      title: 'Services',
      description: 'Liste des services de l\'agence',
      order: 2,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-01-15T10:30:00Z'
    },
    {
      id: 'page-3',
      projectId: 'project-2',
      url: 'https://app.fintech-example.com/dashboard',
      title: 'Tableau de bord',
      description: 'Dashboard principal de l\'application',
      order: 1,
      createdAt: '2023-02-20T14:45:00Z',
      updatedAt: '2023-02-20T14:45:00Z'
    }
  ],
  
  audits: [
    {
      id: 'audit-1',
      projectId: 'project-1',
      name: 'Audit initial',
      createdAt: '2023-02-10T11:20:00Z',
      updatedAt: '2023-02-10T11:20:00Z',
      score: 75,
      version: '1.0',
      items: []
    }
  ],
  
  exigences: [
    {
      id: 'exigence-1',
      projectId: 'project-1',
      itemId: 'check-1',
      importance: ImportanceLevel.Important,
      comment: 'Particulièrement important pour les images de la homepage'
    }
  ],
  
  evaluations: [
    {
      id: 'eval-1',
      auditId: 'audit-1',
      pageId: 'page-1',
      exigenceId: 'exigence-1',
      score: ComplianceStatus.PartiallyCompliant,
      comment: 'Certaines images ne sont pas optimisées',
      attachments: [],
      createdAt: '2023-02-10T11:25:00Z',
      updatedAt: '2023-02-10T11:25:00Z'
    }
  ],
  
  actions: [
    {
      id: 'action-1',
      evaluationId: 'eval-1',
      pageId: 'page-1',
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.High,
      dueDate: '2023-03-15T00:00:00Z',
      responsible: 'John Doe',
      comment: 'Optimiser toutes les images de la page d\'accueil',
      status: ActionStatus.InProgress,
      progress: []
    }
  ],
  
  // Utility functions
  getProjects: function() {
    return this.projects;
  },
  
  getProject: function(id) {
    return this.projects.find(p => p.id === id);
  },
  
  getAudits: function() {
    return this.audits;
  },
  
  getAudit: function(id) {
    return this.audits.find(a => a.id === id);
  },
  
  getChecklistItems: function() {
    return this.checklist;
  },
  
  getChecklistItem: function(id) {
    return this.checklist.find(c => c.id === id);
  },
  
  getPages: function() {
    return this.pages;
  },
  
  getPage: function(id) {
    return this.pages.find(p => p.id === id);
  },
  
  getProjectPages: function(projectId) {
    return this.pages.filter(p => p.projectId === projectId);
  },
  
  getExigences: function() {
    return this.exigences;
  },
  
  getExigence: function(id) {
    return this.exigences.find(e => e.id === id);
  },
  
  getEvaluations: function() {
    return this.evaluations;
  },
  
  getEvaluation: function(id) {
    return this.evaluations.find(e => e.id === id);
  },
  
  getActions: function() {
    return this.actions;
  },
  
  getAction: function(id) {
    return this.actions.find(a => a.id === id);
  },
  
  // CRUD operations
  createProject: function(data) {
    const newProject = {
      id: `proj_${Date.now()}`,
      name: 'New Project',
      url: '',
      description: '',
      status: 'en-cours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      ...data
    };
    this.projects.push(newProject);
    return newProject;
  },
  
  updateProject: function(id, data) {
    const index = this.projects.findIndex(p => p.id === id);
    if (index >= 0) {
      this.projects[index] = { 
        ...this.projects[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      return this.projects[index];
    }
    return null;
  },
  
  createSamplePage: function(data) {
    const now = new Date().toISOString();
    const newPage = {
      id: `page_${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.pages.push(newPage);
    return newPage;
  },
  
  updateSamplePage: function(id, data) {
    const index = this.pages.findIndex(p => p.id === id);
    if (index >= 0) {
      this.pages[index] = { 
        ...this.pages[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      return this.pages[index];
    }
    return null;
  },
  
  deleteSamplePage: function(id) {
    const index = this.pages.findIndex(p => p.id === id);
    if (index >= 0) {
      const deleted = this.pages.splice(index, 1)[0];
      return { success: true, deleted };
    }
    return { success: false };
  },
  
  createNewAudit: function(projectId) {
    const newAudit = {
      id: `audit_${Date.now()}`,
      name: `Audit ${new Date().toLocaleDateString()}`,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
      items: [],
      version: '1.0'
    };
    this.audits.push(newAudit);
    return newAudit;
  }
};

export default mockData;
