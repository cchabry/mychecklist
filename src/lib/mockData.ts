import { Project, Audit, ChecklistItem, Exigence, Evaluation, CorrectiveAction, SamplePage, ComplianceStatus, ImportanceLevel, ActionStatus, ActionPriority } from '@/lib/types';

// Une fonction simple pour générer des ID uniques
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Données de démonstration pour les projets
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'Site institutionnel',
    url: 'https://example.com',
    description: 'Site de présentation de l\'entreprise avec pages produits et contact',
    createdAt: '2023-05-10T14:30:00Z',
    updatedAt: '2023-06-15T09:45:00Z',
    status: 'en-cours',
    progress: 35
  },
  {
    id: 'project-2',
    name: 'Boutique en ligne',
    url: 'https://shop.example.com',
    description: 'E-commerce avec catalogue de produits et panier d\'achat',
    createdAt: '2023-04-20T10:15:00Z',
    updatedAt: '2023-06-12T16:20:00Z',
    status: 'en-cours',
    progress: 68
  },
  {
    id: 'project-3',
    name: 'Application mobile',
    url: 'https://app.example.com',
    description: 'Application mobile disponible sur iOS et Android',
    createdAt: '2023-03-05T08:45:00Z',
    updatedAt: '2023-05-30T11:10:00Z',
    status: 'planifié',
    progress: 15
  }
];

// Données de démonstration pour les items de la checklist
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'item-1',
    title: 'Images responsives',
    consigne: 'Toutes les images doivent être chargées à la bonne résolution selon l\'appareil',
    description: 'Utiliser des attributs srcset et sizes pour définir différentes résolutions d\'images',
    category: 'Médias',
    subcategory: 'Images',
    reference: ['RGESN 1.2.4', 'OPQUAST 123'],
    profile: ['UI Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 'moyen',
    priority: 'haute',
    status: 'actif'
  },
  {
    id: 'item-2',
    title: 'Contraste des textes',
    consigne: 'Le contraste entre les textes et le fond doit être suffisant',
    description: 'Respecter un ratio de contraste de 4.5:1 minimum pour les textes standard et 3:1 pour les grands textes',
    category: 'Accessibilité',
    subcategory: 'Contraste',
    reference: ['RGAA 3.3', 'WCAG 1.4.3'],
    profile: ['UI Designer', 'UX Designer'],
    phase: ['Conception', 'Validation'],
    effort: 'faible',
    priority: 'critique',
    status: 'actif'
  },
  {
    id: 'item-3',
    title: 'Formulaires accessibles',
    consigne: 'Tous les formulaires doivent avoir des labels explicites et des messages d\'erreur clairs',
    description: 'Associer explicitement les labels aux champs, prévoir des messages d\'erreur contextuel, utiliser les attributs ARIA',
    category: 'Accessibilité',
    subcategory: 'Formulaires',
    reference: ['RGAA 11.1', 'WCAG 3.3.2'],
    profile: ['Développeur', 'UX Designer'],
    phase: ['Conception', 'Développement'],
    effort: 'moyen',
    priority: 'haute',
    status: 'actif'
  },
  {
    id: 'item-4',
    title: 'Temps de chargement',
    consigne: 'Le temps de chargement des pages doit être optimisé',
    description: 'Optimiser les images, utiliser la mise en cache, minimiser les resources JS et CSS',
    category: 'Performance',
    subcategory: 'Chargement',
    reference: ['RGESN 3.1.1', 'Core Web Vitals'],
    profile: ['Développeur', 'Architecte'],
    phase: ['Développement', 'Optimisation'],
    effort: 'important',
    priority: 'moyenne',
    status: 'actif'
  },
  {
    id: 'item-5',
    title: 'Navigation clavier',
    consigne: 'Toutes les fonctionnalités doivent être accessibles au clavier',
    description: 'Ordre logique de tabulation, indicateurs visibles de focus, pas de pièges au clavier',
    category: 'Accessibilité',
    subcategory: 'Navigation',
    reference: ['RGAA 12.13', 'WCAG 2.1.1'],
    profile: ['Développeur', 'UX Designer'],
    phase: ['Conception', 'Développement', 'Test'],
    effort: 'moyen',
    priority: 'haute',
    status: 'actif'
  },
  {
    id: 'item-6',
    title: 'Textes alternatifs',
    consigne: 'Toutes les images porteuses d\'information doivent avoir un texte alternatif',
    description: 'Rédiger des textes alternatifs concis et descriptifs, les images décoratives doivent avoir un alt vide',
    category: 'Accessibilité',
    subcategory: 'Images',
    reference: ['RGAA 1.1.1', 'WCAG 1.1.1'],
    profile: ['Rédacteur', 'Développeur'],
    phase: ['Développement', 'Contribution'],
    effort: 'faible',
    priority: 'critique',
    status: 'actif'
  },
  {
    id: 'item-7',
    title: 'Optimisation des images',
    consigne: 'Les images doivent être optimisées pour le web',
    description: 'Utiliser des formats adaptés (WebP, AVIF), compresser les images sans perte de qualité visible',
    category: 'Performance',
    subcategory: 'Médias',
    reference: ['RGESN 4.1.2', 'Core Web Vitals'],
    profile: ['Graphiste', 'Développeur'],
    phase: ['Production', 'Optimisation'],
    effort: 'moyen',
    priority: 'moyenne',
    status: 'actif'
  },
  {
    id: 'item-8',
    title: 'Respect des couleurs de la charte',
    consigne: 'Les couleurs utilisées doivent respecter la charte graphique',
    description: 'N\'utiliser que les couleurs définies dans la charte graphique, y compris pour les états (hover, focus, etc.)',
    category: 'Design',
    subcategory: 'Couleurs',
    reference: ['Guide de marque'],
    profile: ['UI Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 'faible',
    priority: 'basse',
    status: 'actif'
  },
  {
    id: 'item-9',
    title: 'Validation W3C',
    consigne: 'Le code HTML et CSS doit être valide selon les standards W3C',
    description: 'Vérifier la validité du code avec les validateurs W3C, corriger les erreurs',
    category: 'Technique',
    subcategory: 'Standards',
    reference: ['RGAA 8.1', 'OPQUAST 211'],
    profile: ['Développeur'],
    phase: ['Développement', 'Test'],
    effort: 'moyen',
    priority: 'moyenne',
    status: 'actif'
  },
  {
    id: 'item-10',
    title: 'Responsive design',
    consigne: 'Le site doit s\'adapter à toutes les tailles d\'écran',
    description: 'Conception mobile-first, utilisation de media queries, tests sur différents appareils',
    category: 'Design',
    subcategory: 'Responsive',
    reference: ['RGESN 1.1.1', 'OPQUAST 102'],
    profile: ['UI Designer', 'Développeur'],
    phase: ['Conception', 'Développement', 'Test'],
    effort: 'important',
    priority: 'haute',
    status: 'actif'
  },
  {
    id: 'item-11',
    title: 'Compatibilité navigateurs',
    consigne: 'Le site doit fonctionner sur les principaux navigateurs à jour',
    description: 'Tester sur Chrome, Firefox, Safari, Edge (versions N et N-1)',
    category: 'Technique',
    subcategory: 'Compatibilité',
    reference: ['OPQUAST 134'],
    profile: ['Développeur', 'Testeur'],
    phase: ['Développement', 'Test'],
    effort: 'moyen',
    priority: 'haute',
    status: 'actif'
  },
  {
    id: 'item-12',
    title: 'HTTPS obligatoire',
    consigne: 'Le site doit être servi en HTTPS sur toutes les pages',
    description: 'Configuration SSL/TLS à jour, redirection automatique HTTP vers HTTPS, en-têtes de sécurité',
    category: 'Sécurité',
    subcategory: 'Protocoles',
    reference: ['OPQUAST 243', 'RGESN 2.3.1'],
    profile: ['Développeur', 'Administrateur système'],
    phase: ['Développement', 'Déploiement'],
    effort: 'moyen',
    priority: 'critique',
    status: 'actif'
  },
  {
    id: 'item-13',
    title: 'Plan du site',
    consigne: 'Un plan du site accessible doit être disponible',
    description: 'Page dédiée listant toutes les sections principales, sitemap.xml pour les moteurs de recherche',
    category: 'Navigation',
    subcategory: 'Structure',
    reference: ['RGAA 12.2', 'OPQUAST 88'],
    profile: ['UX Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 'faible',
    priority: 'basse',
    status: 'actif'
  },
  {
    id: 'item-14',
    title: 'Fil d\'Ariane',
    consigne: 'Un fil d\'Ariane doit être présent sur toutes les pages de contenu',
    description: 'Affichage du chemin de navigation de la page d\'accueil à la page courante',
    category: 'Navigation',
    subcategory: 'Repères',
    reference: ['OPQUAST 86'],
    profile: ['UX Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 'faible',
    priority: 'moyenne',
    status: 'actif'
  },
  {
    id: 'item-15',
    title: 'Page d\'erreur 404 personnalisée',
    consigne: 'Une page d\'erreur 404 personnalisée doit être définie',
    description: 'Page d\'erreur aidant l\'utilisateur à trouver sa route avec recherche et liens vers sections populaires',
    category: 'Navigation',
    subcategory: 'Erreurs',
    reference: ['OPQUAST 93'],
    profile: ['UX Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 'faible',
    priority: 'basse',
    status: 'actif'
  }
];

// Échantillon de pages pour le projet 1
export const SAMPLE_PAGES: SamplePage[] = [
  {
    id: 'page-1-1',
    projectId: 'project-1',
    url: 'https://example.com',
    title: 'Accueil',
    description: 'Page d\'accueil du site institutionnel',
    order: 1,
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z'
  },
  {
    id: 'page-1-2',
    projectId: 'project-1',
    url: 'https://example.com/about',
    title: 'À propos',
    description: 'Présentation de l\'entreprise',
    order: 2,
    createdAt: '2023-05-15T10:05:00Z',
    updatedAt: '2023-05-15T10:05:00Z'
  },
  {
    id: 'page-1-3',
    projectId: 'project-1',
    url: 'https://example.com/services',
    title: 'Services',
    description: 'Liste des services proposés',
    order: 3,
    createdAt: '2023-05-15T10:10:00Z',
    updatedAt: '2023-05-15T10:10:00Z'
  },
  {
    id: 'page-1-4',
    projectId: 'project-1',
    url: 'https://example.com/contact',
    title: 'Contact',
    description: 'Page de formulaire de contact',
    order: 4,
    createdAt: '2023-05-15T10:15:00Z',
    updatedAt: '2023-05-15T10:15:00Z'
  },
  {
    id: 'page-2-1',
    projectId: 'project-2',
    url: 'https://shop.example.com',
    title: 'Accueil boutique',
    description: 'Page d\'accueil de la boutique en ligne',
    order: 1,
    createdAt: '2023-05-16T09:00:00Z',
    updatedAt: '2023-05-16T09:00:00Z'
  },
  {
    id: 'page-2-2',
    projectId: 'project-2',
    url: 'https://shop.example.com/products',
    title: 'Catalogue produits',
    description: 'Liste des produits disponibles',
    order: 2,
    createdAt: '2023-05-16T09:05:00Z',
    updatedAt: '2023-05-16T09:05:00Z'
  },
  {
    id: 'page-2-3',
    projectId: 'project-2',
    url: 'https://shop.example.com/product/123',
    title: 'Page produit',
    description: 'Détail d\'un produit spécifique',
    order: 3,
    createdAt: '2023-05-16T09:10:00Z',
    updatedAt: '2023-05-16T09:10:00Z'
  },
  {
    id: 'page-2-4',
    projectId: 'project-2',
    url: 'https://shop.example.com/cart',
    title: 'Panier',
    description: 'Page du panier d\'achat',
    order: 4,
    createdAt: '2023-05-16T09:15:00Z',
    updatedAt: '2023-05-16T09:15:00Z'
  },
  {
    id: 'page-2-5',
    projectId: 'project-2',
    url: 'https://shop.example.com/checkout',
    title: 'Paiement',
    description: 'Processus de paiement',
    order: 5,
    createdAt: '2023-05-16T09:20:00Z',
    updatedAt: '2023-05-16T09:20:00Z'
  }
];

// Exigences pour le projet 1
const exigences: Exigence[] = [
  {
    id: 'exigence-1-1',
    projectId: 'project-1',
    itemId: 'item-1',
    importance: ImportanceLevel.Important,
    comment: 'Toutes les images doivent être responsives, particulièrement sur la page d\'accueil'
  },
  {
    id: 'exigence-1-2',
    projectId: 'project-1',
    itemId: 'item-2',
    importance: ImportanceLevel.Important,
    comment: 'Attention particulière aux textes sur fond coloré'
  },
  {
    id: 'exigence-1-3',
    projectId: 'project-1',
    itemId: 'item-3',
    importance: ImportanceLevel.Important,
    comment: 'Formulaire de contact particulièrement concerné'
  },
  {
    id: 'exigence-1-4',
    projectId: 'project-1',
    itemId: 'item-4',
    importance: ImportanceLevel.Important,
    comment: 'Focus sur l\'optimisation des images de la page d\'accueil'
  },
  {
    id: 'exigence-1-5',
    projectId: 'project-1',
    itemId: 'item-5',
    importance: ImportanceLevel.Important,
    comment: 'Toutes les fonctionnalités doivent être accessibles au clavier'
  },
  {
    id: 'exigence-1-6',
    projectId: 'project-1',
    itemId: 'item-6',
    importance: ImportanceLevel.Important,
    comment: 'Particulièrement pour les images du carrousel et des services'
  },
  {
    id: 'exigence-1-7',
    projectId: 'project-1',
    itemId: 'item-7',
    importance: ImportanceLevel.Important,
    comment: 'Utiliser le format WebP avec fallback'
  },
  {
    id: 'exigence-1-8',
    projectId: 'project-1',
    itemId: 'item-10',
    importance: ImportanceLevel.Important,
    comment: 'Design mobile-first obligatoire'
  },
  {
    id: 'exigence-1-9',
    projectId: 'project-1',
    itemId: 'item-11',
    importance: ImportanceLevel.Important,
    comment: 'Support d\'Internet Explorer non requis'
  },
  {
    id: 'exigence-1-10',
    projectId: 'project-1',
    itemId: 'item-12',
    importance: ImportanceLevel.Important,
    comment: 'HTTPS obligatoire sur tout le site'
  }
];

// Audits pour le projet 1
const audits: Audit[] = [
  {
    id: 'audit-1',
    projectId: 'project-1',
    name: 'Audit initial',
    status: 'en-cours',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-05T14:30:00Z',
    completedAt: null,
    progress: 35
  },
  {
    id: 'audit-2',
    projectId: 'project-2',
    name: 'Premier audit',
    status: 'planifié',
    createdAt: '2023-06-10T09:00:00Z',
    updatedAt: '2023-06-10T09:00:00Z',
    completedAt: null,
    progress: 0
  }
];

// Évaluations pour l'audit 1
const evaluations: Evaluation[] = [
  {
    id: 'eval-1-1-1',
    auditId: 'audit-1',
    pageId: 'page-1-1',
    exigenceId: 'exigence-1-1',
    status: ComplianceStatus.NonCompliant,
    score: ComplianceStatus.NonCompliant,
    comment: 'Les images du carrousel ne sont pas responsives',
    attachments: [],
    createdAt: '2023-06-02T11:00:00Z',
    updatedAt: '2023-06-02T11:00:00Z'
  },
  {
    id: 'eval-1-1-2',
    auditId: 'audit-1',
    pageId: 'page-1-2',
    exigenceId: 'exigence-1-1',
    status: ComplianceStatus.Compliant,
    score: ComplianceStatus.Compliant,
    comment: 'Images bien configurées',
    attachments: [],
    createdAt: '2023-06-02T11:15:00Z',
    updatedAt: '2023-06-02T11:15:00Z'
  },
  {
    id: 'eval-1-1-3',
    auditId: 'audit-1',
    pageId: 'page-1-3',
    exigenceId: 'exigence-1-1',
    status: ComplianceStatus.PartiallyCompliant,
    score: ComplianceStatus.PartiallyCompliant,
    comment: 'Images des services pas toutes responsives',
    attachments: [],
    createdAt: '2023-06-02T11:30:00Z',
    updatedAt: '2023-06-02T11:30:00Z'
  },
  {
    id: 'eval-1-1-4',
    auditId: 'audit-1',
    pageId: 'page-1-4',
    exigenceId: 'exigence-1-1',
    status: ComplianceStatus.Compliant,
    score: ComplianceStatus.Compliant,
    comment: 'Pas d\'images significatives sur cette page',
    attachments: [],
    createdAt: '2023-06-02T11:45:00Z',
    updatedAt: '2023-06-02T11:45:00Z'
  },
  {
    id: 'eval-1-2-1',
    auditId: 'audit-1',
    pageId: 'page-1-1',
    exigenceId: 'exigence-1-2',
    status: ComplianceStatus.NonCompliant,
    score: ComplianceStatus.NonCompliant,
    comment: 'Contraste insuffisant pour les textes sur l\'image d\'en-tête',
    attachments: [],
    createdAt: '2023-06-03T10:00:00Z',
    updatedAt: '2023-06-03T10:00:00Z'
  },
  {
    id: 'eval-1-2-2',
    auditId: 'audit-1',
    pageId: 'page-1-2',
    exigenceId: 'exigence-1-2',
    status: ComplianceStatus.Compliant,
    score: ComplianceStatus.Compliant,
    comment: 'Contraste suffisant sur toute la page',
    attachments: [],
    createdAt: '2023-06-03T10:15:00Z',
    updatedAt: '2023-06-03T10:15:00Z'
  }
];

// Actions correctives
const now = new Date().toISOString();
const actions: CorrectiveAction[] = [
  {
    id: 'action-1',
    evaluationId: 'eval-1-1-1',
    pageId: 'page-1-1',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.High,
    dueDate: '2023-06-15T00:00:00Z',
    responsible: 'dev@example.com',
    comment: 'Mettre à jour les images du carrousel avec srcset et sizes',
    status: ActionStatus.ToDo,
    progress: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'action-2',
    evaluationId: 'eval-1-1-3',
    pageId: 'page-1-3',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.Medium,
    dueDate: '2023-06-20T00:00:00Z',
    responsible: 'dev@example.com',
    comment: 'Rendre responsives les images des services',
    status: ActionStatus.ToDo,
    progress: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'action-3',
    evaluationId: 'eval-1-2-1',
    pageId: 'page-1-1',
    targetScore: ComplianceStatus.Compliant,
    priority: ActionPriority.High,
    dueDate: '2023-06-10T00:00:00Z',
    responsible: 'design@example.com',
    comment: 'Améliorer le contraste des textes sur l\'image d\'en-tête',
    status: ActionStatus.InProgress,
    progress: [],
    createdAt: now,
    updatedAt: now
  }
];

// Données pour un audit en cours sur le projet 1 avec des items à évaluer
const auditItemsProject1 = CHECKLIST_ITEMS.map(item => {
  const exigence = exigences.find(e => e.itemId === item.id);
  return {
    ...item,
    status: 'non-évalué',
    importance: exigence?.importance || 'N/A',
    projectRequirement: exigence?.comment || '',
    projectComment: exigence?.comment || '',
    pageResults: SAMPLE_PAGES
      .filter(page => page.projectId === 'project-1')
      .map(page => ({
        pageId: page.id,
        status: 'non-évalué'
      }))
  };
});

// Export des données mockées
export const mockData = {
  projects: MOCK_PROJECTS,
  audits,
  checklist: CHECKLIST_ITEMS,
  pages: SAMPLE_PAGES,
  exigences,
  evaluations,
  actions,
  auditItemsProject1,
  
  // Méthodes utilitaires pour manipuler les données mockées
  getProjects: () => MOCK_PROJECTS,
  getProject: (id: string) => MOCK_PROJECTS.find(project => project.id === id),
  getAudits: () => audits,
  getAudit: (id: string) => audits.find(audit => audit.id === id),
  getAuditsByProject: (projectId: string) => audits.filter(audit => audit.projectId === projectId),
  getChecklist: () => CHECKLIST_ITEMS,
  getChecklistItem: (id: string) => CHECKLIST_ITEMS.find(item => item.id === id),
  getExigences: () => exigences,
  getExigencesByProject: (projectId: string) => exigences.filter(exigence => exigence.projectId === projectId),
  getEvaluations: () => evaluations,
  getEvaluationsByAudit: (auditId: string) => evaluations.filter(evaluation => evaluation.auditId === auditId),
  getActions: () => actions,
  getActionsByEvaluation: (evaluationId: string) => actions.filter(action => action.evaluationId === evaluationId),
  getPages: () => SAMPLE_PAGES,
  getPagesByProject: (projectId: string) => SAMPLE_PAGES.filter(page => page.projectId === projectId),
  getPage: (id: string) => SAMPLE_PAGES.find(page => page.id === id),
  getAuditItems: (projectId: string) => auditItemsProject1.filter(_ => projectId === 'project-1'),
  
  // Add these specific export functions
  getAllProjects: () => MOCK_PROJECTS,
  getMockAuditHistory: (projectId: string) => audits.filter(audit => audit.projectId === projectId),
  getMockActionHistory: (evaluationId: string) => actions.filter(action => action.evaluationId === evaluationId),
  
  // Added missing CRUD methods for evaluations and actions
  createEvaluation: function(data) {
    const now = new Date().toISOString();
    const newEvaluation = {
      id: `eval_${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.evaluations.push(newEvaluation);
    return newEvaluation;
  },
  
  updateEvaluation: function(id, data) {
    const index = this.evaluations.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    this.evaluations[index] = {
      ...this.evaluations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.evaluations[index];
  },
  
  deleteEvaluation: function(id) {
    const index = this.evaluations.findIndex(e => e.id === id);
    if (index === -1) return false;
    
    this.evaluations.splice(index, 1);
    return true;
  },
  
  createAction: function(data) {
    const now = new Date().toISOString();
    const newAction = {
      id: `action_${Date.now()}`,
      progress: [],
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.actions.push(newAction);
    return newAction;
  },
  
  updateAction: function(id, data) {
    const index = this.actions.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    this.actions[index] = {
      ...this.actions[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.actions[index];
  },
  
  deleteAction: function(id) {
    const index = this.actions.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    this.actions.splice(index, 1);
    return true;
  },
  
  // Méthodes CRUD pour les pages d'échantillon
  createPage: (data: any) => {
    const newId = `page_${Date.now()}`;
    return { 
      id: newId, 
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString() 
    };
  },

  updatePage: (id: string, data: any) => {
    return { 
      id, 
      ...data, 
      updated: true,
      updatedAt: new Date().toISOString() 
    };
  },

  getProjectPages: (projectId: string) => {
    return SAMPLE_PAGES.filter((page) => page.projectId === projectId);
  },

  createSamplePage: (pageData: any) => {
    const newPage = {
      id: `page_${Date.now()}`,
      projectId: pageData.projectId,
      url: pageData.url,
      title: pageData.title || 'Nouvelle page',
      description: pageData.description || '',
      order: SAMPLE_PAGES.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    SAMPLE_PAGES.push(newPage);
    return newPage;
  },

  updateSamplePage: (pageId: string, pageData: any) => {
    const pageIndex = SAMPLE_PAGES.findIndex((p) => p.id === pageId);
    if (pageIndex === -1) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    SAMPLE_PAGES[pageIndex] = {
      ...SAMPLE_PAGES[pageIndex],
      ...pageData,
      updatedAt: new Date().toISOString()
    };
    return SAMPLE_PAGES[pageIndex];
  },

  deletePage: (pageId: string) => {
    const pageIndex = SAMPLE_PAGES.findIndex((p) => p.id === pageId);
    if (pageIndex === -1) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    SAMPLE_PAGES.splice(pageIndex, 1);
    return { success: true, id: pageId };
  },
};

// Create a utility function to create a mock audit - used in multiple places
export const createMockAudit = (projectId: string) => {
  return {
    id: `audit_${Date.now()}`,
    name: `Audit ${new Date().toLocaleDateString()}`,
    projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: 0,
    items: [],
    version: '1.0'
  };
};

// Create a new audit without any existing data
export const createNewAudit = createMockAudit;

// Helper to get project by ID
export const getProjectById = (id: string) => MOCK_PROJECTS.find(project => project.id === id);

// Helper to get pages by project ID
export const getPagesByProjectId = (projectId: string) => SAMPLE_PAGES.filter(page => page.projectId === projectId);

// Helper to get audit history for a project
export const getMockAuditHistory = (projectId: string) => audits.filter(audit => audit.projectId === projectId);

// Helper to get action history for an evaluation
export const getMockActionHistory = (evaluationId: string) => actions.filter(action => action.evaluationId === evaluationId);

// Export some commonly used mock data directly
export { CHECKLIST_ITEMS as CATEGORIES };

// Default export
export default mockData;

//

