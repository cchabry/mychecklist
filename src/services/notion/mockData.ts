
/**
 * Données de démo pour le mode démo
 */

import { Project, ChecklistItem } from '@/types/domain';

interface MockData {
  projects: Project[];
  checklists: ChecklistItem[];
}

const mockData: MockData = {
  projects: [
    {
      id: 'proj_1',
      name: 'Site vitrine Acme Corp',
      url: 'https://www.acme-corp.com',
      description: 'Site vitrine pour la société Acme Corp, spécialiste des produits innovants.',
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-03-20T14:45:00Z',
      status: 'active',
      lastAuditDate: '2023-03-15T09:00:00Z',
      progress: 75
    },
    {
      id: 'proj_2',
      name: 'Plateforme e-commerce Bio Market',
      url: 'https://biomarket.example.com',
      description: 'Site e-commerce de produits biologiques et écologiques.',
      createdAt: '2023-02-05T09:15:00Z',
      updatedAt: '2023-04-10T16:20:00Z',
      status: 'active',
      lastAuditDate: '2023-04-05T11:30:00Z',
      progress: 60
    },
    {
      id: 'proj_3',
      name: 'Blog Tech Insights',
      url: 'https://tech-insights.example.org',
      description: 'Blog sur les dernières actualités technologiques et analyses du marché.',
      createdAt: '2023-03-10T13:45:00Z',
      updatedAt: '2023-05-01T10:00:00Z',
      status: 'pending',
      progress: 30
    },
    {
      id: 'proj_4',
      name: 'Application mobile FitTrack',
      url: 'https://fittrack.example.io',
      description: 'Application de suivi d\'activité physique et de coaching sportif.',
      createdAt: '2023-04-20T08:30:00Z',
      updatedAt: '2023-05-15T15:10:00Z',
      status: 'active',
      progress: 45
    },
    {
      id: 'proj_5',
      name: 'Intranet Globex Corporation',
      url: 'https://intranet.globex.example',
      description: 'Intranet pour la gestion des ressources internes de Globex Corporation.',
      createdAt: '2023-01-02T11:00:00Z',
      updatedAt: '2023-04-30T09:45:00Z',
      status: 'completed',
      lastAuditDate: '2023-04-25T14:00:00Z',
      progress: 100
    }
  ],
  checklists: [
    {
      id: 'item_1',
      consigne: 'Utiliser des attributs alt descriptifs pour les images',
      description: 'Toutes les images doivent avoir un attribut alt qui décrit ce que l\'image représente, sauf pour les images décoratives qui doivent avoir un alt vide.',
      category: 'Accessibilité',
      subcategory: 'Images',
      reference: ['RGAA 1.1.1', 'WCAG 1.1.1'],
      profil: ['Développeur', 'Contributeur'],
      phase: ['Développement', 'Contribution'],
      effort: 1,
      priority: 5
    },
    {
      id: 'item_2',
      consigne: 'Utiliser des contrastes de couleur suffisants',
      description: 'Les contrastes entre le texte et le fond doivent être suffisamment élevés pour assurer une bonne lisibilité (4.5:1 minimum pour le texte standard).',
      category: 'Accessibilité',
      subcategory: 'Couleurs',
      reference: ['RGAA 3.3', 'WCAG 1.4.3'],
      profil: ['UI Designer', 'Développeur'],
      phase: ['Conception', 'Développement'],
      effort: 2,
      priority: 4
    },
    {
      id: 'item_3',
      consigne: 'Optimiser les images pour le web',
      description: 'Toutes les images doivent être compressées et optimisées pour réduire leur poids sans perdre en qualité visuelle significative.',
      category: 'Performance',
      subcategory: 'Médias',
      reference: ['RGESN 4.3'],
      profil: ['Développeur', 'UI Designer'],
      phase: ['Développement', 'Intégration'],
      effort: 1,
      priority: 3
    },
    {
      id: 'item_4',
      consigne: 'Structure cohérente des titres (h1-h6)',
      description: 'Les titres doivent suivre une hiérarchie logique sans sauter de niveau, avec un seul h1 par page.',
      category: 'Accessibilité',
      subcategory: 'Structure',
      reference: ['RGAA 9.1', 'WCAG 1.3.1'],
      profil: ['Développeur', 'Contributeur'],
      phase: ['Développement', 'Contribution'],
      effort: 1,
      priority: 4
    },
    {
      id: 'item_5',
      consigne: 'Site responsive sur tous les appareils',
      description: 'Le site doit s\'adapter à tous les appareils, du mobile au desktop, en passant par les tablettes.',
      category: 'Expérience utilisateur',
      subcategory: 'Responsive design',
      reference: ['OPQUAST 121'],
      profil: ['UI Designer', 'Développeur'],
      phase: ['Conception', 'Développement'],
      effort: 3,
      priority: 5
    }
  ]
};

export default mockData;
