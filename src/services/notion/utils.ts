
/**
 * Utilitaires pour les services Notion
 */
import { ChecklistItem } from '@/types/domain';

/**
 * Génère des items de checklist fictifs pour le mode mock
 */
export function generateMockChecklistItems(): ChecklistItem[] {
  return [
    {
      id: 'item-1',
      name: 'Accessibilité des médias',
      consigne: 'Tous les médias doivent être accessibles',
      description: 'Vérifier que les médias (images, vidéos, etc.) sont accessibles aux utilisateurs en situation de handicap',
      category: 'Accessibilité',
      subcategory: 'Médias',
      reference: ['RGAA 1.1', 'WCAG 2.1'],
      profil: ['Designer', 'Développeur'],
      phase: ['Conception', 'Développement'],
      effort: 3,
      priority: 4
    },
    {
      id: 'item-2',
      name: 'Responsive design',
      consigne: 'Le site doit être responsive',
      description: 'Vérifier que le site s\'adapte à toutes les tailles d\'écran',
      category: 'Technique',
      subcategory: 'Compatibilité',
      reference: ['OPQUAST 121'],
      profil: ['Designer', 'Développeur'],
      phase: ['Conception', 'Développement'],
      effort: 2,
      priority: 5
    }
  ];
}
