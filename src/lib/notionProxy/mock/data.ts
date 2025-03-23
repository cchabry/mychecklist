
import { 
  ActionPriority, 
  ActionStatus, 
  ComplianceStatus, 
  ChecklistItem, 
  Audit, 
  Project, 
  Evaluation, 
  CorrectiveAction,
  Exigence,
  ImportanceLevel
} from '@/lib/types';

/**
 * Fournit des données fictives pour les tests et le mode démo
 */
export const mockData = {
  /**
   * Récupère tous les projets fictifs
   */
  getProjects(): Project[] {
    return [
      {
        id: 'project-1',
        name: 'Site web corporate',
        url: 'https://example.com',
        description: 'Refonte du site web corporate',
        status: 'En cours',
        createdAt: '2023-05-15T14:00:00.000Z',
        updatedAt: '2023-05-20T09:30:00.000Z',
        progress: 45,
        itemsCount: 24,
        pagesCount: 8
      },
      {
        id: 'project-2',
        name: 'Application mobile',
        url: 'https://mobile.example.com',
        description: 'Développement de l\'application mobile',
        status: 'Planifié',
        createdAt: '2023-06-01T10:00:00.000Z',
        updatedAt: '2023-06-02T16:45:00.000Z',
        progress: 20,
        itemsCount: 18,
        pagesCount: 5
      }
    ];
  },

  /**
   * Récupère un projet fictif par son ID
   */
  getProject(id: string): Project | null {
    const project = this.getProjects().find(p => p.id === id);
    return project || null;
  },

  /**
   * Récupère tous les audits fictifs
   */
  getAudits(): Audit[] {
    return [
      {
        id: 'audit-1',
        name: 'Audit initial',
        projectId: 'project-1',
        createdAt: '2023-05-16T10:00:00.000Z',
        updatedAt: '2023-05-16T15:30:00.000Z',
        score: 65,
        items: [],
        version: '1.0'
      },
      {
        id: 'audit-2',
        name: 'Audit de suivi',
        projectId: 'project-1',
        createdAt: '2023-06-15T09:00:00.000Z',
        updatedAt: '2023-06-15T14:45:00.000Z',
        score: 78,
        items: [],
        version: '1.1'
      }
    ];
  },

  /**
   * Récupère un audit fictif par son ID
   */
  getAudit(id: string): Audit | null {
    const audit = this.getAudits().find(a => a.id === id);
    return audit || null;
  },

  /**
   * Récupère tous les items de checklist fictifs
   */
  getChecklistItems(): ChecklistItem[] {
    return [
      {
        id: 'item-1',
        title: 'Accessibilité des images',
        description: 'Toutes les images doivent avoir un texte alternatif',
        category: 'Accessibilité',
        subcategory: 'Images',
        criteria: 'RGAA 1.1',
        reference: 'RGAA 1.1, WCAG 2.1',
        profile: 'Développeur',
        phase: 'Développement',
        effort: 'Faible',
        priority: 'Élevée',
        requirementLevel: 'AA',
        scope: 'Technique',
        consigne: 'Vérifier que toutes les images ont un attribut alt',
        status: ComplianceStatus.NotEvaluated
      },
      {
        id: 'item-2',
        title: 'Contraste des textes',
        description: 'Les textes doivent avoir un contraste suffisant',
        category: 'Accessibilité',
        subcategory: 'Contraste',
        criteria: 'RGAA 3.3',
        reference: 'RGAA 3.3, WCAG 2.1',
        profile: 'Designer',
        phase: 'Conception',
        effort: 'Moyen',
        priority: 'Élevée',
        requirementLevel: 'AA',
        scope: 'Design',
        consigne: 'Vérifier que le contraste entre le texte et le fond est d\'au moins 4.5:1',
        status: ComplianceStatus.NotEvaluated
      }
    ];
  },

  /**
   * Récupère un item de checklist fictif par son ID
   */
  getChecklistItem(id: string): ChecklistItem | null {
    const item = this.getChecklistItems().find(i => i.id === id);
    return item || null;
  },

  /**
   * Récupère toutes les exigences fictives
   */
  getExigences(): Exigence[] {
    return [
      {
        id: 'exigence-1',
        projectId: 'project-1',
        itemId: 'item-1',
        importance: ImportanceLevel.Major,
        comment: 'Critère prioritaire pour notre site'
      },
      {
        id: 'exigence-2',
        projectId: 'project-1',
        itemId: 'item-2',
        importance: ImportanceLevel.Medium,
        comment: 'À vérifier sur toutes les pages'
      },
      {
        id: 'exigence-3',
        projectId: 'project-2',
        itemId: 'item-1',
        importance: ImportanceLevel.Major,
        comment: 'Important pour l\'accessibilité mobile'
      }
    ];
  },

  /**
   * Récupère une exigence fictive par son ID
   */
  getExigence(id: string): Exigence | null {
    const exigence = this.getExigences().find(e => e.id === id);
    return exigence || null;
  },

  /**
   * Récupère toutes les évaluations fictives
   */
  getEvaluations(): Evaluation[] {
    return [
      {
        id: 'evaluation-1',
        auditId: 'audit-1',
        pageId: 'page-1',
        exigenceId: 'exigence-1',
        score: ComplianceStatus.Compliant,
        comment: 'Toutes les images ont des alternatives textuelles',
        attachments: ['capture1.png'],
        createdAt: '2023-05-16T11:15:00.000Z',
        updatedAt: '2023-05-16T11:15:00.000Z'
      },
      {
        id: 'evaluation-2',
        auditId: 'audit-1',
        pageId: 'page-2',
        exigenceId: 'exigence-1',
        score: ComplianceStatus.PartiallyCompliant,
        comment: 'Certaines images décoratives ont des alt vides',
        attachments: ['capture2.png', 'capture3.png'],
        createdAt: '2023-05-16T12:30:00.000Z',
        updatedAt: '2023-05-16T12:30:00.000Z'
      },
      {
        id: 'evaluation-3',
        auditId: 'audit-1',
        pageId: 'page-1',
        exigenceId: 'exigence-2',
        score: ComplianceStatus.NonCompliant,
        comment: 'Contraste insuffisant sur les textes gris',
        attachments: ['capture4.png'],
        createdAt: '2023-05-16T13:45:00.000Z',
        updatedAt: '2023-05-16T13:45:00.000Z'
      }
    ];
  },

  /**
   * Récupère une évaluation fictive par son ID
   */
  getEvaluation(id: string): Evaluation | null {
    const evaluation = this.getEvaluations().find(e => e.id === id);
    return evaluation || null;
  },

  /**
   * Récupère toutes les actions correctives fictives
   */
  getActions(): CorrectiveAction[] {
    return [
      {
        id: 'action-1',
        evaluationId: 'evaluation-2',
        pageId: 'page-2',
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.High,
        dueDate: '2023-06-15',
        responsible: 'Jean Dupont',
        comment: 'Ajouter des alt vides sur les images décoratives',
        status: ActionStatus.InProgress,
        progress: [
          {
            date: '2023-05-20T10:00:00.000Z',
            responsible: 'Jean Dupont',
            comment: 'Début de l\'intervention',
            status: ActionStatus.InProgress
          }
        ],
        createdAt: '2023-05-16T14:00:00.000Z',
        updatedAt: '2023-05-20T10:00:00.000Z'
      },
      {
        id: 'action-2',
        evaluationId: 'evaluation-3',
        pageId: 'page-1',
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.Critical,
        dueDate: '2023-06-01',
        responsible: 'Marie Martin',
        comment: 'Augmenter le contraste des textes gris à 4.5:1',
        status: ActionStatus.ToDo,
        progress: [],
        createdAt: '2023-05-16T14:15:00.000Z',
        updatedAt: '2023-05-16T14:15:00.000Z'
      }
    ];
  },

  /**
   * Récupère une action corrective fictive par son ID
   */
  getAction(id: string): CorrectiveAction | null {
    const action = this.getActions().find(a => a.id === id);
    return action || null;
  },

  /**
   * Crée une évaluation fictive
   */
  createEvaluation(data: Partial<Evaluation>): Evaluation {
    const now = new Date().toISOString();
    const newEvaluation: Evaluation = {
      id: `evaluation-${Date.now()}`,
      auditId: data.auditId || '',
      pageId: data.pageId || '',
      exigenceId: data.exigenceId || '',
      score: data.score || ComplianceStatus.NotEvaluated,
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now
    };
    return newEvaluation;
  },

  /**
   * Met à jour une évaluation fictive
   */
  updateEvaluation(id: string, data: Partial<Evaluation>): Evaluation {
    const evaluation = this.getEvaluation(id);
    if (!evaluation) {
      throw new Error(`Évaluation avec ID ${id} introuvable`);
    }
    const updatedEvaluation: Evaluation = {
      ...evaluation,
      ...data,
      updatedAt: new Date().toISOString()
    };
    return updatedEvaluation;
  },

  /**
   * Supprime une évaluation fictive
   */
  deleteEvaluation(id: string): boolean {
    return true; // Simule une suppression réussie
  },

  /**
   * Crée une action corrective fictive
   */
  createAction(data: Partial<CorrectiveAction>): CorrectiveAction {
    const now = new Date().toISOString();
    const newAction: CorrectiveAction = {
      id: `action-${Date.now()}`,
      evaluationId: data.evaluationId || '',
      pageId: data.pageId || '',
      targetScore: data.targetScore || ComplianceStatus.NotEvaluated,
      priority: data.priority || ActionPriority.Medium,
      dueDate: data.dueDate || '',
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status || ActionStatus.ToDo,
      progress: data.progress || [],
      createdAt: now,
      updatedAt: now
    };
    return newAction;
  },

  /**
   * Met à jour une action corrective fictive
   */
  updateAction(id: string, data: Partial<CorrectiveAction>): CorrectiveAction {
    const action = this.getAction(id);
    if (!action) {
      throw new Error(`Action avec ID ${id} introuvable`);
    }
    const updatedAction: CorrectiveAction = {
      ...action,
      ...data,
      updatedAt: new Date().toISOString()
    };
    return updatedAction;
  },

  /**
   * Supprime une action corrective fictive
   */
  deleteAction(id: string): boolean {
    return true; // Simule une suppression réussie
  },

  /**
   * Récupère les pages d'échantillon fictives
   */
  getSamplePages() {
    return [
      {
        id: 'page-1',
        projectId: 'project-1',
        url: 'https://example.com/accueil',
        title: 'Page d\'accueil',
        description: 'Page principale du site',
        order: 1
      },
      {
        id: 'page-2',
        projectId: 'project-1',
        url: 'https://example.com/produits',
        title: 'Catalogue produits',
        description: 'Liste des produits disponibles',
        order: 2
      }
    ];
  },

  /**
   * Récupère une page d'échantillon par son ID
   */
  getSamplePage(id: string) {
    return this.getSamplePages().find(p => p.id === id) || null;
  }
};
