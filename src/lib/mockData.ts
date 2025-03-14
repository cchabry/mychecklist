import { ChecklistItem, Project, Audit, ComplianceStatus } from './types';

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

// Projets fictifs
export const MOCK_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "Site E-commerce",
    url: "https://example-ecommerce.com",
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-10-20T14:45:00Z",
    progress: 100,
    itemsCount: CHECKLIST_ITEMS.length
  },
  {
    id: "project-2",
    name: "Site Corporate",
    url: "https://example-corporate.com",
    createdAt: "2023-09-20T08:15:00Z",
    updatedAt: "2023-09-25T11:20:00Z",
    progress: 73,
    itemsCount: CHECKLIST_ITEMS.length
  },
  {
    id: "project-3",
    name: "Application Web",
    url: "https://example-webapp.com",
    createdAt: "2023-11-05T13:45:00Z",
    updatedAt: "2023-11-05T13:45:00Z",
    progress: 0,
    itemsCount: CHECKLIST_ITEMS.length
  }
];

// Créer un audit avec statuts aléatoires pour la démo
export const createMockAudit = (projectId: string): Audit => {
  const statuses = [
    ComplianceStatus.NonCompliant,
    ComplianceStatus.PartiallyCompliant,
    ComplianceStatus.Compliant,
    ComplianceStatus.NotEvaluated
  ];
  
  const auditItems = CHECKLIST_ITEMS.map(item => ({
    ...item,
    status: projectId === "project-3" 
      ? ComplianceStatus.NotEvaluated 
      : statuses[Math.floor(Math.random() * 3)] // Exclude NotEvaluated for completed audits
  }));

  // Calculer le score (uniquement pour les projets avec des évaluations)
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

  return {
    id: `audit-${projectId}`,
    projectId,
    items: auditItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score
  };
};

// Récupérer un projet par son ID
export const getProjectById = (id: string): Project | undefined => {
  return MOCK_PROJECTS.find(project => project.id === id);
};

// Fonction pour créer un nouvel audit
export const createNewAudit = (projectId: string): Audit => {
  const auditItems = CHECKLIST_ITEMS.map(item => ({
    ...item,
    status: ComplianceStatus.NotEvaluated
  }));

  return {
    id: `audit-${projectId}-${Date.now()}`,
    projectId,
    items: auditItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: 0
  };
};
