
/**
 * Tests unitaires pour les utilitaires de checklist
 */

import { describe, it, expect } from 'vitest';
import { 
  filterChecklistItems, 
  sortChecklistItems,
  extractUniqueCategories,
  extractUniqueSubcategories,
  getEffortLevel,
  getPriorityLevel
} from '../utils';
import { ChecklistItem } from '../types';

describe('Checklist Utils', () => {
  // Exemples d'items pour les tests
  const items: ChecklistItem[] = [
    {
      id: '1',
      consigne: 'Utiliser des textes alternatifs',
      description: 'Images accessibles',
      category: 'Accessibilité',
      subcategory: 'Images',
      reference: ['RGAA 1.1'],
      profil: ['Développeur'],
      phase: ['Développement'],
      effort: 2,
      priority: 5
    },
    {
      id: '2',
      consigne: 'Optimiser les images',
      description: 'Images compressées',
      category: 'Performance',
      subcategory: 'Médias',
      reference: ['RGESN 4.2'],
      profil: ['Designer'],
      phase: ['Design', 'Développement'],
      effort: 3,
      priority: 3
    },
    {
      id: '3',
      consigne: 'Contraste de texte suffisant',
      description: 'Contrastes WCAG AA',
      category: 'Accessibilité',
      subcategory: 'Contenu',
      reference: ['RGAA 3.2'],
      profil: ['Designer'],
      phase: ['Design'],
      effort: 1,
      priority: 4
    }
  ];

  describe('filterChecklistItems', () => {
    it('devrait retourner tous les items si aucun filtre n\'est spécifié', () => {
      const result = filterChecklistItems(items, {});
      expect(result).toHaveLength(3);
    });

    it('devrait filtrer par catégorie', () => {
      const result = filterChecklistItems(items, { category: 'Accessibilité' });
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id)).toContain('1');
      expect(result.map(item => item.id)).toContain('3');
    });

    it('devrait filtrer par sous-catégorie', () => {
      const result = filterChecklistItems(items, { subcategory: 'Images' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('devrait filtrer par recherche textuelle', () => {
      const result = filterChecklistItems(items, { search: 'image' });
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id)).toContain('1');
      expect(result.map(item => item.id)).toContain('2');
    });

    it('devrait combiner plusieurs critères de filtrage', () => {
      const result = filterChecklistItems(items, { 
        category: 'Accessibilité',
        search: 'texte'
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('sortChecklistItems', () => {
    it('devrait trier par priorité descendante', () => {
      const result = sortChecklistItems(items, 'priority_desc');
      expect(result.map(item => item.id)).toEqual(['1', '3', '2']);
    });

    it('devrait trier par priorité ascendante', () => {
      const result = sortChecklistItems(items, 'priority_asc');
      expect(result.map(item => item.id)).toEqual(['2', '3', '1']);
    });

    it('devrait trier par catégorie ascendante', () => {
      const result = sortChecklistItems(items, 'category_asc');
      expect(result.map(item => item.category)).toEqual(['Accessibilité', 'Accessibilité', 'Performance']);
    });
  });

  describe('extractUniqueCategories', () => {
    it('devrait extraire les catégories uniques', () => {
      const result = extractUniqueCategories(items);
      expect(result).toHaveLength(2);
      expect(result).toContain('Accessibilité');
      expect(result).toContain('Performance');
    });
  });

  describe('extractUniqueSubcategories', () => {
    it('devrait extraire les sous-catégories uniques', () => {
      const result = extractUniqueSubcategories(items);
      expect(result).toHaveLength(3);
      expect(result).toContain('Images');
      expect(result).toContain('Médias');
      expect(result).toContain('Contenu');
    });
  });

  describe('getEffortLevel', () => {
    it('devrait convertir les niveaux d\'effort', () => {
      expect(getEffortLevel(1)).toBe('FAIBLE');
      expect(getEffortLevel(3)).toBe('MOYEN');
      expect(getEffortLevel(4)).toBe('ÉLEVÉ');
    });
  });

  describe('getPriorityLevel', () => {
    it('devrait convertir les niveaux de priorité', () => {
      expect(getPriorityLevel(1)).toBe('BASSE');
      expect(getPriorityLevel(3)).toBe('MOYENNE');
      expect(getPriorityLevel(4)).toBe('HAUTE');
    });
  });
});
