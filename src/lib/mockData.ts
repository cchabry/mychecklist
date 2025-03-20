import { 
  ChecklistItem, 
  Project, 
  Audit, 
  ComplianceStatus, 
  ImportanceLevel, 
  SamplePage,
  ActionPriority,
  ActionStatus,
  CorrectiveAction,
  ActionProgress
} from './types';

// Catégories d'audit
export const CATEGORIES = [
  "Accessibilité",
  "Performance",
  "SEO",
  "UX",
  "Sécurité",
  "Bonnes pratiques"
];

// Items de la checklist
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "item-1",
    title: "Images with alternative text",
    description: "All images must have appropriate alternative text that describes the content of the image.",
    category: "Accessibilité",
    subcategory: "Images",
    metaRefs: "WCAG 1.1.1",
    criteria: "Texte alternatif",
    profile: "Développeur",
    phase: "Développement",
    effort: "Faible",
    priority: "Haute",
    requirementLevel: "Obligatoire",
    scope: "Toutes pages"
  },
  {
    id: "item-2",
    title: "Keyboard navigation",
    description: "The website must be fully navigable using only the keyboard.",
    category: "Accessibilité",
    subcategory: "Navigation",
    metaRefs: "WCAG 2.1.1",
    criteria: "Clavier",
    profile: "Développeur",
    phase: "Développement",
    effort: "Moyen",
    priority: "Haute",
    requirementLevel: "Obligatoire",
    scope: "Toutes pages"
  },
  {
    id: "item-3",
    title: "Sufficient color contrast",
    description: "All text must have sufficient contrast with its background according to WCAG guidelines.",
    category: "Accessibilité",
    subcategory: "Visuels",
    metaRefs: "WCAG 1.4.3",
    criteria: "Contraste",
    profile: "Graphiste",
    phase: "Design",
    effort: "Faible",
    priority: "Haute",
    requirementLevel: "Obligatoire",
    scope: "Toutes pages"
  },
  {
    id: "item-4",
    title: "Page load time",
    description: "The page must load in less than 3 seconds on a standard connection.",
    category: "Performance",
    subcategory: "Vitesse",
    criteria: "Temps de chargement",
    profile: "Développeur",
    phase: "Développement",
    effort: "Élevé",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-5",
    title: "Optimized images",
    description: "All images must be appropriately sized and compressed.",
    category: "Performance",
    subcategory: "Médias",
    criteria: "Optimisation images",
    profile: "Développeur",
    phase: "Développement",
    effort: "Moyen",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-6",
    title: "Proper heading structure",
    description: "Pages must use h1-h6 headings in a logical hierarchical order.",
    category: "SEO",
    subcategory: "Structure",
    criteria: "Structure de titre",
    profile: "Développeur",
    phase: "Développement",
    effort: "Faible",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-7",
    title: "Meta descriptions",
    description: "Each page must have a unique and descriptive meta description.",
    category: "SEO",
    subcategory: "Description",
    criteria: "Description de page",
    profile: "Développeur",
    phase: "Développement",
    effort: "Moyen",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-8",
    title: "Mobile-friendly design",
    description: "The website must be fully responsive and usable on mobile devices.",
    category: "UX",
    subcategory: "Responsive",
    criteria: "Design mobile",
    profile: "Développeur",
    phase: "Développement",
    effort: "Élevé",
    priority: "Haute",
    requirementLevel: "Obligatoire",
    scope: "Toutes pages"
  },
  {
    id: "item-9",
    title: "HTTPS implementation",
    description: "The website must use HTTPS with a valid SSL certificate.",
    category: "Sécurité",
    subcategory: "Sécurité",
    criteria: "HTTPS",
    profile: "Développeur",
    phase: "Développement",
    effort: "Faible",
    priority: "Haute",
    requirementLevel: "Obligatoire",
    scope: "Toutes pages"
  },
  {
    id: "item-10",
    title: "Clear navigation",
    description: "Navigation must be intuitive and consistent across the website.",
    category: "UX",
    subcategory: "Navigation",
    criteria: "Navigation intuitive",
    profile: "Développeur",
    phase: "Développement",
    effort: "Moyen",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-11",
    title: "Form validation",
    description: "All forms must provide clear validation messages for user inputs.",
    category: "UX",
    subcategory: "Validation",
    criteria: "Validation formulaire",
    profile: "Développeur",
    phase: "Développement",
    effort: "Faible",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-12",
    title: "Content Security Policy",
    description: "Implement appropriate Content Security Policy headers.",
    category: "Sécurité",
    subcategory: "Sécurité",
    criteria: "CSP",
    profile: "Développeur",
    phase: "Développement",
    effort: "Moyen",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-13",
    title: "Semantic HTML",
    description: "Use semantic HTML elements appropriately throughout the website.",
    category: "Bonnes pratiques",
    subcategory: "HTML",
    criteria: "HTML semantique",
    profile: "Développeur",
    phase: "Développement",
    effort: "Faible",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-14",
    title: "No broken links",
    description: "Ensure there are no broken internal or external links.",
    category: "Bonnes pratiques",
    subcategory: "Liens",
    criteria: "Liens brisés",
    profile: "Développeur",
    phase: "Développement",
    effort: "Moyen",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  },
  {
    id: "item-15",
    title: "Browser compatibility",
    description: "The website must work correctly on all major browsers.",
    category: "Bonnes pratiques",
    subcategory: "Compatibilité",
    criteria: "Compatibilité",
    profile: "Développeur",
    phase: "Développement",
    effort: "Élevé",
    priority: "Moyenne",
    requirementLevel: "Recommandé",
    scope: "Toutes pages"
  }
];

// Pages d'échantillon pour les projets
export const SAMPLE_PAGES: SamplePage[] = [
  {
    id: "page-1-1",
    projectId: "project-1",
    url: "https://example-ecommerce.com",
    title: "Page d'accueil",
    description: "Page principale du site",
    order: 1
  },
  {
    id: "page-1-2",
    projectId: "project-1",
    url: "https://example-ecommerce.com/products",
    title: "Page de produits",
    description: "Catalogue des produits",
    order: 2
  },
  {
    id: "page-1-3",
    projectId: "project-1",
    url: "https://example-ecommerce.com/cart",
    title: "Panier",
    description: "Page du panier d'achat",
    order: 3
  },
  {
    id: "page-1-4",
    projectId: "project-1",
    url: "https://example-ecommerce.com/checkout",
    title: "Checkout",
    description: "Processus de paiement",
    order: 4
  },
  {
    id: "page-2-1",
    projectId: "project-2",
    url: "https://example-corporate.com",
    title: "Page d'accueil",
    description: "Page principale du site",
    order: 1
  },
  {
    id: "page-2-2",
    projectId: "project-2",
    url: "https://example-corporate.com/about",
    title: "À propos",
    description: "Présentation de l'entreprise",
    order: 2
  },
  {
    id: "page-2-3",
    projectId: "project-2",
    url: "https://example-corporate.com/contact",
    title: "Contact",
    description: "Formulaire de contact",
    order: 3
  },
  {
    id: "page-3-1",
    projectId: "project-3",
    url: "https://example-webapp.com",
    title: "Page d'accueil",
    description: "Page principale de l'application",
    order: 1
  },
  {
    id: "page-3-2",
    projectId: "project-3",
    url: "https://example-webapp.com/dashboard",
    title: "Tableau de bord",
    description: "Interface principale utilisateur",
    order: 2
  }
];

// Projets fictifs
export const MOCK_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "Site E-commerce",
    url: "https://example-ecommerce.com",
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-10-20T14:45:00Z",
    progress: 100,
    itemsCount: CHECKLIST_ITEMS.length,
    pagesCount: 4
  },
  {
    id: "project-2",
    name: "Site Corporate",
    url: "https://example-corporate.com",
    createdAt: "2023-09-20T08:15:00Z",
    updatedAt: "2023-09-25T11:20:00Z",
    progress: 73,
    itemsCount: CHECKLIST_ITEMS.length,
    pagesCount: 3
  },
  {
    id: "project-3",
    name: "Application Web",
    url: "https://example-webapp.com",
    createdAt: "2023-11-05T13:45:00Z",
    updatedAt: "2023-11-05T13:45:00Z",
    progress: 0,
    itemsCount: CHECKLIST_ITEMS.length,
    pagesCount: 2
  }
];

// Obtenir les pages d'un projet
export const getProjectPages = (projectId: string): SamplePage[] => {
  return SAMPLE_PAGES.filter(page => page.projectId === projectId);
};

// Générer des actions correctives aléatoires pour une évaluation
const generateMockActions = (evaluationId: string): CorrectiveAction[] => {
  const priorities = Object.values(ActionPriority);
  const statuses = Object.values(ActionStatus);
  
  const actionsCount = Math.floor(Math.random() * 3);
  const actions: CorrectiveAction[] = [];
  
  for (let i = 0; i < actionsCount; i++) {
    actions.push({
      id: `action-${evaluationId}-${i}`,
      evaluationId,
      targetScore: ComplianceStatus.Compliant,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      responsible: ["John Doe", "Jane Smith", "Marc Dubois"][Math.floor(Math.random() * 3)],
      comment: Math.random() > 0.5 ? "Action à réaliser selon les critères" : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return actions;
};

// Créer un audit avec statuts aléatoires pour la démo
export const createMockAudit = (projectId: string): Audit => {
  const statuses = [
    ComplianceStatus.NonCompliant,
    ComplianceStatus.PartiallyCompliant,
    ComplianceStatus.Compliant,
    ComplianceStatus.NotEvaluated
  ];
  
  const importanceLevels = [
    ImportanceLevel.Majeur,
    ImportanceLevel.Important,
    ImportanceLevel.Moyen,
    ImportanceLevel.Mineur,
    ImportanceLevel.NA
  ];
  
  const projectPages = getProjectPages(projectId);
  
  const auditItems = CHECKLIST_ITEMS.map(item => {
    const globalStatus = projectId === "project-3" 
      ? ComplianceStatus.NotEvaluated 
      : statuses[Math.floor(Math.random() * 3)];
    
    const pageResults = projectPages.map(page => {
      const pageStatus = projectId === "project-3" 
        ? ComplianceStatus.NotEvaluated 
        : statuses[Math.floor(Math.random() * 3)];
      
      return {
        pageId: page.id,
        status: pageStatus,
        comment: pageStatus !== ComplianceStatus.NotEvaluated && Math.random() > 0.7 
          ? "Commentaire sur l'évaluation de cette page" 
          : undefined
      };
    });
    
    const actions = pageResults
      .filter(result => result.status === ComplianceStatus.NonCompliant || result.status === ComplianceStatus.PartiallyCompliant)
      .flatMap(result => generateMockActions(`${item.id}-${result.pageId}`));
    
    return {
      ...item,
      status: globalStatus,
      pageResults,
      importance: importanceLevels[Math.floor(Math.random() * importanceLevels.length)],
      projectRequirement: Math.random() > 0.7 ? "Exigence spécifique pour ce projet" : undefined,
      projectComment: Math.random() > 0.8 ? "Commentaire détaillé sur l'exigence pour ce projet" : undefined,
      actions
    };
  });

  let score = 0;
  if (projectId !== "project-3") {
    const evaluated = auditItems.filter(item => item.status !== ComplianceStatus.NotEvaluated);
    if (evaluated.length > 0) {
      const totalScore = evaluated.reduce((acc, item) => {
        if (item.status === ComplianceStatus.Compliant) return acc + 1;
        if (item.status === ComplianceStatus.PartiallyCompliant) return acc + 0.5;
        return acc;
      }, 0);
      score = Math.round((totalScore / evaluated.length) * 100);
    }
  }

  const auditDate = new Date().toISOString().split("T")[0];
  const auditName = `Audit ${auditDate}`;

  return {
    id: `audit-${projectId}`,
    projectId,
    name: auditName,
    items: auditItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score,
    version: "1.0"
  };
};

// Récupérer un projet par son ID
export const getProjectById = (id: string): Project | undefined => {
  return MOCK_PROJECTS.find(project => project.id === id);
};

// Récupérer les pages d'un projet par l'ID du projet
export const getPagesByProjectId = (projectId: string): SamplePage[] => {
  return SAMPLE_PAGES.filter(page => page.projectId === projectId);
};

// Récupérer une page par son ID
export const getPageById = (id: string): SamplePage | undefined => {
  return SAMPLE_PAGES.find(page => page.id === id);
};

// Fonction pour créer un nouvel audit
export const createNewAudit = (projectId: string): Audit => {
  const projectPages = getPagesByProjectId(projectId);
  
  const auditItems = CHECKLIST_ITEMS.map(item => {
    const pageResults = projectPages.map(page => ({
      pageId: page.id,
      status: ComplianceStatus.NotEvaluated
    }));
    
    return {
      ...item,
      status: ComplianceStatus.NotEvaluated,
      importance: ImportanceLevel.NA,
      pageResults
    };
  });

  const auditDate = new Date().toISOString().split("T")[0];
  const auditName = `Audit ${auditDate}`;

  return {
    id: `audit-${projectId}-${Date.now()}`,
    projectId,
    name: auditName,
    items: auditItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: 0,
    version: "1.0"
  };
};

// Fonction pour récupérer tous les projets
export const getAllProjects = () => {
  return MOCK_PROJECTS;
};

// Simuler plusieurs audits pour le projet 1 (historique)
export const getMockAuditHistory = (projectId: string): Audit[] => {
  if (projectId !== "project-1") {
    return [];
  }
  
  const today = new Date();
  
  return [
    {
      id: `audit-${projectId}-1`,
      projectId,
      name: "Audit initial",
      items: [],
      createdAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(today.getTime() - 85 * 24 * 60 * 60 * 1000).toISOString(),
      score: 42,
      version: "1.0"
    },
    {
      id: `audit-${projectId}-2`,
      projectId,
      name: "Audit intermédiaire",
      items: [],
      createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(today.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      score: 68,
      version: "1.1"
    },
    {
      id: `audit-${projectId}-3`,
      projectId,
      name: "Audit final",
      items: [],
      createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      score: 89,
      version: "1.2"
    }
  ];
};

// Récupérer l'historique complet des actions correctives pour un projet
export const getMockActionHistory = (projectId: string): CorrectiveAction[] => {
  const actions: CorrectiveAction[] = [];
  
  let actionCount = 0;
  if (projectId === "project-1") {
    actionCount = 8 + Math.floor(Math.random() * 8);
  } else if (projectId === "project-2") {
    actionCount = 4 + Math.floor(Math.random() * 5);
  }
  
  const priorities = Object.values(ActionPriority);
  const statuses = Object.values(ActionStatus);
  const pages = getPagesByProjectId(projectId);
  
  for (let i = 0; i < actionCount; i++) {
    const page = pages[Math.floor(Math.random() * pages.length)];
    const item = CHECKLIST_ITEMS[Math.floor(Math.random() * CHECKLIST_ITEMS.length)];
    
    actions.push({
      id: `action-${projectId}-${i}`,
      evaluationId: `eval-${item.id}-${page.id}`,
      targetScore: ComplianceStatus.Compliant,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      responsible: ["John Doe", "Jane Smith", "Marc Dubois"][Math.floor(Math.random() * 3)],
      comment: `Correction requise pour ${item.title} sur ${page.title}`,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return actions;
};

// Récupérer le suivi de progression pour une action corrective
export const getMockActionProgress = (actionId: string): ActionProgress[] => {
  const progressCount = Math.floor(Math.random() * 4);
  const progressEntries: ActionProgress[] = [];
  
  const statuses = Object.values(ActionStatus);
  const now = new Date();
  
  for (let i = 0; i < progressCount; i++) {
    progressEntries.push({
      id: `progress-${actionId}-${i}`,
      actionId,
      date: new Date(now.getTime() - (progressCount - i) * 5 * 24 * 60 * 60 * 1000).toISOString(),
      responsible: ["John Doe", "Jane Smith", "Marc Dubois"][Math.floor(Math.random() * 3)],
      comment: `Mise à jour du ${i + 1}/${progressCount}`,
      score: i === progressCount - 1 ? ComplianceStatus.Compliant : ComplianceStatus.PartiallyCompliant,
      status: i === progressCount - 1 ? ActionStatus.Done : ActionStatus.InProgress
    });
  }
  
  return progressEntries;
};

