
/**
 * Tests unitaires pour les utilitaires de checklist
 */

import { describe, it, expect } from 'vitest';
import { 
  filterExigences,
  sortExigences,
  enrichExigencesWithItems,
  calculateExigenceStats
} from '../utils';
import { ExigenceWithItem } from '../types';
import { ImportanceLevel } from '@/types/enums';
import { ChecklistItem, Exigence } from '@/types/domain';

describe('Exigence Utils', () => {
  // Exemples d'items pour les tests
  const checklistItems: ChecklistItem[] = [
    {
      id: 'item-1',
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
      id: 'item-2',
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
      id: 'item-3',
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

  // Exemples d'exigences simples pour les tests
  const basicExigences: Exigence[] = [
    {
      id: 'exig-1',
      projectId: 'project-1',
      itemId: 'item-1',
      importance: ImportanceLevel.Major,
      comment: "Crucial pour l'accessibilité"
    },
    {
      id: 'exig-2',
      projectId: 'project-1',
      itemId: 'item-2',
      importance: ImportanceLevel.Medium,
      comment: "Important pour les performances"
    },
    {
      id: 'exig-3',
      projectId: 'project-1',
      itemId: 'item-3',
      importance: ImportanceLevel.Important,
      comment: "Nécessaire pour l'accessibilité"
    }
  ];

  // Exemples d'exigences enrichies pour les tests
  const exigences: ExigenceWithItem[] = basicExigences.map((exigence, index) => ({
    ...exigence,
    checklistItem: checklistItems[index]
  }));

  describe('enrichExigencesWithItems', () => {
    it('devrait enrichir les exigences avec les informations des items', () => {
      const result = enrichExigencesWithItems(basicExigences, checklistItems);
      
      expect(result).toHaveLength(3);
      expect(result[0].checklistItem).toBeDefined();
      expect(result[0].checklistItem?.consigne).toBe('Utiliser des textes alternatifs');
      expect(result[1].checklistItem?.consigne).toBe('Optimiser les images');
    });

    it('devrait gérer les items manquants', () => {
      const testExigences = [
        {
          id: 'exig-1',
          projectId: 'project-1',
          itemId: 'item-nonexistent',
          importance: ImportanceLevel.Major,
          comment: "Item qui n'existe pas"
        }
      ];

      const result = enrichExigencesWithItems(testExigences, checklistItems);
      
      expect(result).toHaveLength(1);
      expect(result[0].checklistItem).toBeDefined();
      expect(result[0].checklistItem?.consigne).toBe('Item inconnu');
    });
  });

  describe('filterExigences', () => {
    it('devrait retourner toutes les exigences si aucun filtre n\'est spécifié', () => {
      const result = filterExigences(exigences, { search: '' });
      expect(result).toHaveLength(3);
    });

    it('devrait filtrer par importance', () => {
      const result = filterExigences(exigences, { search: '', importance: ImportanceLevel.Major });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exig-1');
    });

    it('devrait filtrer par catégorie', () => {
      const result = filterExigences(exigences, { search: '', category: 'Accessibilité' });
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toContain('exig-1');
      expect(result.map(e => e.id)).toContain('exig-3');
    });

    it('devrait filtrer par sous-catégorie', () => {
      const result = filterExigences(exigences, { search: '', subCategory: 'Images' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exig-1');
    });

    it('devrait filtrer par recherche textuelle', () => {
      const result = filterExigences(exigences, { search: 'performances' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exig-2');
    });

    it('devrait combiner plusieurs critères de filtrage', () => {
      const result = filterExigences(exigences, { 
        category: 'Accessibilité',
        search: 'accessibilité'
      });
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toContain('exig-1');
      expect(result.map(e => e.id)).toContain('exig-3');
    });
  });

  describe('sortExigences', () => {
    it('devrait trier par importance descendante', () => {
      const result = sortExigences(exigences, 'importance_desc');
      expect(result.map(e => e.id)).toEqual(['exig-1', 'exig-3', 'exig-2']);
    });

    it('devrait trier par importance ascendante', () => {
      const result = sortExigences(exigences, 'importance_asc');
      expect(result.map(e => e.id)).toEqual(['exig-2', 'exig-3', 'exig-1']);
    });

    it('devrait trier par catégorie ascendante', () => {
      const result = sortExigences(exigences, 'category_asc');
      // Using optional chaining to handle potentially undefined checklistItem
      const categories = result.map(e => e.checklistItem?.category);
      expect(categories).toEqual(['Accessibilité', 'Accessibilité', 'Performance']);
    });

    it('devrait trier par catégorie descendante', () => {
      const result = sortExigences(exigences, 'category_desc');
      // Using optional chaining to handle potentially undefined checklistItem
      const categories = result.map(e => e.checklistItem?.category);
      expect(categories).toEqual(['Performance', 'Accessibilité', 'Accessibilité']);
    });
  });
  
  describe('calculateExigenceStats', () => {
    it('devrait calculer correctement les statistiques', () => {
      const stats = calculateExigenceStats(exigences);
      
      expect(stats.total).toBe(3);
      expect(stats.byImportance[ImportanceLevel.Major]).toBe(1);
      expect(stats.byImportance[ImportanceLevel.Important]).toBe(1);
      expect(stats.byImportance[ImportanceLevel.Medium]).toBe(1);
      expect(stats.byImportance[ImportanceLevel.Minor]).toBe(0);
      expect(stats.byImportance[ImportanceLevel.NA]).toBe(0);
    });
    
    it('devrait gérer un tableau vide', () => {
      const stats = calculateExigenceStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.byImportance[ImportanceLevel.Major]).toBe(0);
      expect(stats.byImportance[ImportanceLevel.Important]).toBe(0);
      expect(stats.byImportance[ImportanceLevel.Medium]).toBe(0);
      expect(stats.byImportance[ImportanceLevel.Minor]).toBe(0);
      expect(stats.byImportance[ImportanceLevel.NA]).toBe(0);
    });
  });
});
