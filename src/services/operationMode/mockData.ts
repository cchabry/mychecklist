
/**
 * Données simulées pour le mode démo
 */

import { Project, Audit, AuditPage, Requirements, ChecklistItem } from '@/lib/types';

// Projets simulés
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'demo-project-1',
    name: 'Site e-commerce Démo',
    url: 'https://demo-ecommerce.example.com',
    description: 'Site de démonstration pour un e-commerce',
    status: 'En cours',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-04-22T14:15:00Z',
    progress: 65,
    itemsCount: 42,
    pagesCount: 5
  },
  {
    id: 'demo-project-2',
    name: 'Portail intranet Démo',
    url: 'https://demo-intranet.example.org',
    description: 'Portail intranet avec espace collaboratif',
    status: 'Terminé',
    createdAt: '2023-03-10T08:45:00Z',
    updatedAt: '2023-05-01T16:20:00Z',
    progress: 100,
    itemsCount: 36,
    pagesCount: 8
  },
  {
    id: 'demo-project-3',
    name: 'Application mobile Démo',
    url: 'https://demo-app.example.io',
    description: 'Version mobile du site principal',
    status: 'Planifié',
    createdAt: '2023-04-05T11:00:00Z',
    updatedAt: '2023-04-05T11:00:00Z',
    progress: 0,
    itemsCount: 28,
    pagesCount: 0
  }
];

// Items de checklist simulés
export const MOCK_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'check-1',
    title: 'Images avec attributs alt',
    description: 'Toutes les images doivent avoir un attribut alt descriptif ou vide selon leur contexte',
    category: 'Accessibilité',
    subcategory: 'Images',
    importance: 'high',
    reference: ['RGAA 1.1.1', 'WCAG 1.1.1'],
    effort: 'medium'
  },
  {
    id: 'check-2',
    title: 'Contraste des couleurs',
    description: 'Les contrastes entre le texte et le fond doivent être suffisants (4.5:1 minimum)',
    category: 'Accessibilité',
    subcategory: 'Couleurs',
    importance: 'high',
    reference: ['RGAA 3.2', 'WCAG 1.4.3'],
    effort: 'high'
  },
  {
    id: 'check-3',
    title: 'Favicon présente et valide',
    description: 'Le site doit avoir une favicon dans différentes tailles pour les différents appareils',
    category: 'Technique',
    subcategory: 'Performance',
    importance: 'medium',
    reference: ['OPQUAST 7'],
    effort: 'low'
  },
  {
    id: 'check-4',
    title: 'Responsive design',
    description: 'Le site doit s\'adapter correctement à toutes les tailles d\'écran',
    category: 'UX',
    subcategory: 'Mobile',
    importance: 'high',
    reference: ['OPQUAST 15'],
    effort: 'high'
  },
  {
    id: 'check-5',
    title: 'Validation HTML',
    description: 'Le code HTML doit être valide selon les standards W3C',
    category: 'Technique',
    subcategory: 'Qualité du code',
    importance: 'medium',
    reference: ['OPQUAST 22'],
    effort: 'medium'
  }
];

// Exigences simulées
export const MOCK_REQUIREMENTS: Requirements = {
  'check-1': { importance: 'major', comment: 'Requis pour conformité RGAA' },
  'check-2': { importance: 'important', comment: 'Contraste minimum 4.5:1' },
  'check-3': { importance: 'minor', comment: 'À implémenter selon disponibilité' },
  'check-4': { importance: 'major', comment: 'Validation obligatoire sur mobile et tablette' },
  'check-5': { importance: 'important', comment: 'Tolérance pour les widgets tiers' }
};

// Pages d'audit simulées
export const MOCK_AUDIT_PAGES: AuditPage[] = [
  {
    id: 'page-1',
    url: 'https://demo-ecommerce.example.com/accueil',
    title: 'Page d\'accueil',
    description: 'Page principale du site'
  },
  {
    id: 'page-2',
    url: 'https://demo-ecommerce.example.com/produits',
    title: 'Catalogue produits',
    description: 'Liste des produits disponibles'
  },
  {
    id: 'page-3',
    url: 'https://demo-ecommerce.example.com/produit/1',
    title: 'Fiche produit',
    description: 'Détail d\'un produit spécifique'
  },
  {
    id: 'page-4',
    url: 'https://demo-ecommerce.example.com/panier',
    title: 'Panier',
    description: 'Page du panier d\'achat'
  },
  {
    id: 'page-5',
    url: 'https://demo-ecommerce.example.com/contact',
    title: 'Contact',
    description: 'Formulaire de contact'
  }
];

// Audits simulés
export const MOCK_AUDITS: Audit[] = [
  {
    id: 'audit-1',
    projectId: 'demo-project-1',
    name: 'Audit initial',
    createdAt: '2023-04-10T09:30:00Z',
    updatedAt: '2023-04-15T16:45:00Z',
    status: 'Terminé',
    progress: 100,
    requirements: MOCK_REQUIREMENTS,
    pages: MOCK_AUDIT_PAGES,
    evaluations: {}
  },
  {
    id: 'audit-2',
    projectId: 'demo-project-2',
    name: 'Audit Q1 2023',
    createdAt: '2023-01-20T11:15:00Z',
    updatedAt: '2023-01-25T14:30:00Z',
    status: 'Terminé',
    progress: 100,
    requirements: MOCK_REQUIREMENTS,
    pages: MOCK_AUDIT_PAGES,
    evaluations: {}
  }
];

/**
 * Génère des données simulées pour un projet spécifique
 */
export function getMockDataForProject(projectId: string) {
  // Trouver le projet
  const project = MOCK_PROJECTS.find(p => p.id === projectId) || MOCK_PROJECTS[0];
  
  // Filtrer les audits pour ce projet
  const audits = MOCK_AUDITS.filter(a => a.projectId === projectId);
  
  return {
    project,
    audits,
    checklistItems: MOCK_CHECKLIST_ITEMS
  };
}
