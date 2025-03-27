
/**
 * Tests unitaires pour les utilitaires d'exigences
 */

import { describe, it, expect } from 'vitest';
import { 
  enrichExigencesWithItems,
  filterExigences,
  sortExigences,
  extractUniqueCategories,
  extractUniqueSubcategories,
  getExigenceStats
} from '../utils';
import { Exigence, ExigenceWithItem } from '../types';
import { ChecklistItem } from '@/types/domain';
import { ImportanceLevel } from '../constants';

describe('Exigences Utils', () => {
  // Exemple de données pour les tests
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
    }
  ];

  const exigences: Exigence[] = [
    {
      id: 'exig-1',
      projectId: 'project-1',
      itemId: 'item-1',
      importance: ImportanceLevel.MAJEUR,
      comment: 'Très important pour l\'accessibilité'
    },
    {
      id: 'exig-2',
      projectId: 'project-1',
      itemId: 'item-2',
      importance: ImportanceLevel.MOYEN,
      comment: 'Important pour les performances'
    },
    {
      id: 'exig-3',
      projectId: 'project-1',
      itemId: 'item-inconnu',
      importance: ImportanceLevel.MINEUR,
      comment: 'Item qui n\'existe plus'
    }
  ];

  describe('enrichExigencesWithItems', () => {
    it('devrait enrichir les exigences avec les items de checklist', () => {
      const result = enrichExigencesWithItems(exigences, checklistItems);
      
      // Vérifier le nombre d'exigences
      expect(result).toHaveLength(3);
      
      // Vérifier les détails d'une exigence enrichie
      const enrichedExigence = result.find(e => e.id === 'exig-1');
      expect(enrichedExigence).toBeDefined();
      expect(enrichedExigence?.checklistItem.consigne).toBe('Utiliser des textes alternatifs');
      
      // Vérifier que les exigences sans item correspondant ont un placeholder
      const missingItemExigence = result.find(e => e.id === 'exig-3');
      expect(missingItemExigence).toBeDefined();
      expect(missingItemExigence?.checklistItem.consigne).toBe('Item inconnu');
    });
  });

  // Données d'exemple pour les tests suivants
  const enrichedExigences: ExigenceWithItem[] = enrichExigencesWithItems(exigences, checklistItems);

  describe('filterExigences', () => {
    it('devrait filtrer par niveau d\'importance', () => {
      const result = filterExigences(enrichedExigences, { importance: ImportanceLevel.MAJEUR });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exig-1');
    });

    it('devrait filtrer par catégorie', () => {
      const result = filterExigences(enrichedExigences, { category: 'Performance' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exig-2');
    });

    it('devrait filtrer par texte', () => {
      const result = filterExigences(enrichedExigences, { search: 'accessibilité' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exig-1');
    });
  });

  describe('sortExigences', () => {
    it('devrait trier par importance descendante', () => {
      const result = sortExigences(enrichedExigences, 'importance_desc');
      expect(result.map(e => e.id)).toEqual(['exig-1', 'exig-2', 'exig-3']);
    });

    it('devrait trier par importance ascendante', () => {
      const result = sortExigences(enrichedExigences, 'importance_asc');
      expect(result.map(e => e.id)).toEqual(['exig-3', 'exig-2', 'exig-1']);
    });

    it('devrait trier par catégorie ascendante', () => {
      const result = sortExigences(enrichedExigences, 'category_asc');
      // Noter que l'exigence avec l'item manquant aura 'Non catégorisé' comme catégorie
      expect(result.map(e => e.checklistItem.category)).toEqual([
        'Accessibilité', 
        'Non catégorisé', 
        'Performance'
      ]);
    });
  });

  describe('extractUniqueCategories', () => {
    it('devrait extraire les catégories uniques', () => {
      const result = extractUniqueCategories(enrichedExigences);
      expect(result).toHaveLength(3);
      expect(result).toContain('Accessibilité');
      expect(result).toContain('Performance');
      expect(result).toContain('Non catégorisé');
    });
  });

  describe('extractUniqueSubcategories', () => {
    it('devrait extraire les sous-catégories uniques', () => {
      const result = extractUniqueSubcategories(enrichedExigences);
      expect(result).toHaveLength(3);
      expect(result).toContain('Images');
      expect(result).toContain('Médias');
      expect(result).toContain('Non catégorisé');
    });
  });

  describe('getExigenceStats', () => {
    it('devrait calculer les statistiques des exigences', () => {
      const stats = getExigenceStats(enrichedExigences);
      
      // Vérifier le total
      expect(stats.total).toBe(3);
      
      // Vérifier les exigences par niveau d'importance
      expect(stats.byImportance[ImportanceLevel.MAJEUR]).toBe(1);
      expect(stats.byImportance[ImportanceLevel.MOYEN]).toBe(1);
      expect(stats.byImportance[ImportanceLevel.MINEUR]).toBe(1);
      expect(stats.byImportance[ImportanceLevel.N_A]).toBe(0);
      
      // Vérifier le nombre d'exigences applicables
      expect(stats.applicable).toBe(3);
    });
  });
});
