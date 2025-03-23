
import { Project, Audit, ChecklistItem, Exigence, Page, Evaluation, Action, Progress } from '@/lib/types';

// Projets de démonstration
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Site e-commerce Acme",
    url: "https://acme-demo.com",
    createdAt: "2023-01-15T10:30:00.000Z",
    updatedAt: "2023-04-20T14:45:00.000Z",
    progress: 75
  },
  {
    id: "2",
    name: "Refonte Intranet XYZ Corp",
    url: "https://intranet-xyz.demo",
    createdAt: "2023-03-10T09:15:00.000Z",
    updatedAt: "2023-05-05T11:20:00.000Z",
    progress: 40
  }
];

// Audits de démonstration
export const mockAudits: Audit[] = [
  {
    id: "a1",
    name: "Audit initial",
    projectId: "1",
    createdAt: "2023-02-10T09:30:00.000Z",
    updatedAt: "2023-02-12T15:45:00.000Z",
    status: "Terminé"
  },
  {
    id: "a2",
    name: "Audit de suivi",
    projectId: "1",
    createdAt: "2023-04-15T14:30:00.000Z",
    updatedAt: "2023-04-16T10:45:00.000Z",
    status: "En cours"
  }
];

// Checklist de démonstration
export const mockChecklist: ChecklistItem[] = [
  {
    id: "c1",
    title: "Optimisation des images",
    description: "Toutes les images doivent être optimisées pour le web avec un format adapté (WebP de préférence) et un poids raisonnable.",
    category: "Médias",
    subcategory: "Images",
    references: ["RGESN 4.1", "OPQUAST 156"],
    profiles: ["Développeur", "Contributeur"],
    phases: ["Conception", "Développement"],
    effort: "medium",
    priority: "high"
  },
  {
    id: "c2",
    title: "Accessibilité des liens",
    description: "Tous les liens doivent avoir un texte explicite ou un attribut aria-label.",
    category: "Accessibilité",
    subcategory: "Navigation",
    references: ["RGAA 6.1.1", "WCAG 2.4.4"],
    profiles: ["Développeur", "UX Designer"],
    phases: ["Conception", "Développement"],
    effort: "low",
    priority: "high"
  },
  {
    id: "c3",
    title: "Contraste des textes",
    description: "Les textes doivent avoir un contraste suffisant avec leur arrière-plan (4.5:1 minimum).",
    category: "Accessibilité",
    subcategory: "Couleurs",
    references: ["RGAA 3.3", "WCAG 1.4.3"],
    profiles: ["UX Designer", "UI Designer"],
    phases: ["Conception"],
    effort: "medium",
    priority: "high"
  }
];

// Exigences de démonstration
export const mockExigences: Exigence[] = [
  {
    id: "e1",
    projectId: "1",
    itemId: "c1",
    importance: "major",
    comment: "Particulièrement important pour ce projet e-commerce avec beaucoup de produits"
  },
  {
    id: "e2",
    projectId: "1",
    itemId: "c2",
    importance: "medium",
    comment: "À vérifier sur toutes les pages"
  },
  {
    id: "e3",
    projectId: "1",
    itemId: "c3",
    importance: "major",
    comment: "Important sur les pages produits et le tunnel de commande"
  }
];

// Pages échantillon de démonstration
export const mockPages: Page[] = [
  {
    id: "p1",
    projectId: "1",
    url: "https://acme-demo.com/",
    title: "Page d'accueil",
    description: "Page principale du site",
    order: 0
  },
  {
    id: "p2",
    projectId: "1",
    url: "https://acme-demo.com/category/electronics",
    title: "Catégorie Électronique",
    description: "Listing des produits électroniques",
    order: 1
  },
  {
    id: "p3",
    projectId: "1",
    url: "https://acme-demo.com/product/smartphone-x200",
    title: "Page produit Smartphone X200",
    description: "Fiche produit détaillée",
    order: 2
  },
  {
    id: "p4",
    projectId: "1",
    url: "https://acme-demo.com/cart",
    title: "Panier",
    description: "Page du panier d'achat",
    order: 3
  },
  {
    id: "p5",
    projectId: "1",
    url: "https://acme-demo.com/checkout",
    title: "Tunnel de commande",
    description: "Processus de finalisation d'achat",
    order: 4
  }
];

// Évaluations de démonstration
export const mockEvaluations: Evaluation[] = [
  {
    id: "ev1",
    auditId: "a1",
    pageId: "p1",
    exigenceId: "e1",
    score: "compliant",
    comment: "Toutes les images sont correctement optimisées",
    attachments: [],
    createdAt: "2023-02-10T10:15:00.000Z",
    updatedAt: "2023-02-10T10:15:00.000Z"
  },
  {
    id: "ev2",
    auditId: "a1",
    pageId: "p2",
    exigenceId: "e1",
    score: "partially_compliant",
    comment: "Quelques images de produits ne sont pas en WebP",
    attachments: [],
    createdAt: "2023-02-10T11:30:00.000Z",
    updatedAt: "2023-02-10T11:30:00.000Z"
  },
  {
    id: "ev3",
    auditId: "a1",
    pageId: "p1",
    exigenceId: "e2",
    score: "non_compliant",
    comment: "Plusieurs liens dans le footer n'ont pas de texte explicite",
    attachments: [],
    createdAt: "2023-02-10T14:20:00.000Z",
    updatedAt: "2023-02-10T14:20:00.000Z"
  }
];

// Actions correctives de démonstration
export const mockActions: Action[] = [
  {
    id: "act1",
    evaluationId: "ev2",
    targetScore: "compliant",
    priority: "medium",
    dueDate: "2023-03-15T00:00:00.000Z",
    responsible: "John Doe",
    comment: "Convertir toutes les images de la catégorie en format WebP",
    status: "done"
  },
  {
    id: "act2",
    evaluationId: "ev3",
    targetScore: "compliant",
    priority: "high",
    dueDate: "2023-03-01T00:00:00.000Z",
    responsible: "Jane Smith",
    comment: "Ajouter des textes explicites à tous les liens du footer",
    status: "in_progress"
  }
];

// Progrès de démonstration
export const mockProgress: Progress[] = [
  {
    id: "pr1",
    actionId: "act1",
    date: "2023-03-10T15:45:00.000Z",
    responsible: "John Doe",
    comment: "Conversion de 50% des images terminée",
    score: "partially_compliant",
    status: "in_progress"
  },
  {
    id: "pr2",
    actionId: "act1",
    date: "2023-03-15T09:30:00.000Z",
    responsible: "John Doe",
    comment: "Toutes les images sont maintenant en WebP",
    score: "compliant",
    status: "done"
  }
];
