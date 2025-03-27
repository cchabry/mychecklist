
/**
 * Tests pour les utilitaires des exigences
 */

import { describe, it, expect } from 'vitest';
import { 
  filterExigences,
  sortExigences,
  enrichExigencesWithItems,
  groupExigencesByCategory,
  countExigencesByImportance
} from '../utils';
import { Exigence, ExigenceWithItem } from '../types';
import { ImportanceLevel } from '@/types/enums';
import { ChecklistItem } from '@/types/domain';

// Données de test
const checklistItems: ChecklistItem[] = [
  {
    id: 'item1',
    consigne: 'Item 1',
    description: 'Description item 1',
    category: 'UX',
    subcategory: 'Navigation',
    reference: ['RGAA 1.1'],
    profil: ['Designer'],
    phase: ['Conception'],
    effort: 1,
    priority: 3
  },
  {
    id: 'item2',
    consigne: 'Item 2',
    description: 'Description item 2',
    category: 'Technique',
    subcategory: 'Performance',
    reference: ['RGESN 2.1'],
    profil: ['Développeur'],
    phase: ['Développement'],
    effort: 2,
    priority: 2
  },
  {
    id: 'item3',
    consigne: 'Item 3',
    description: 'Description item 3',
    category: 'UX',
    subcategory: 'Formulaire',
    reference: ['OPQUAST 3.1'],
    profil: ['Designer', 'Développeur'],
    phase: ['Conception', 'Développement'],
    effort: 3,
    priority: 1
  }
];

const exigences: Exigence[] = [
  {
    id: 'exigence1',
    projectId: 'project1',
    itemId: 'item1',
    importance: ImportanceLevel.Major,
    comment: 'Commentaire exigence 1'
  },
  {
    id: 'exigence2',
    projectId: 'project1',
    itemId: 'item2',
    importance: ImportanceLevel.Medium,
    comment: 'Commentaire exigence 2'
  },
  {
    id: 'exigence3',
    projectId: 'project1',
    itemId: 'item3',
    importance: ImportanceLevel.NotApplicable,
    comment: 'Commentaire exigence 3'
  }
];

// Exigences enrichies pour les tests
const enrichedExigences: ExigenceWithItem[] = exigences.map((exigence, index) => ({
  ...exigence,
  checklistItem: checklistItems[index]
}));

describe('Utilitaires d\'exigences', () => {
  describe('enrichExigencesWithItems', () => {
    it('doit correctement enrichir les exigences avec les items de checklist', () => {
      const result = enrichExigencesWithItems(exigences, checklistItems);
      
      // Vérifier que les résultats contiennent les items de checklist
      expect(result).toHaveLength(exigences.length);
      expect(result[0].checklistItem).toEqual(checklistItems[0]);
      expect(result[1].checklistItem).toEqual(checklistItems[1]);
      expect(result[2].checklistItem).toEqual(checklistItems[2]);
    });
    
    it('doit gérer les cas où l\'item de checklist n\'est pas trouvé', () => {
      const exigencesSansItem = [
        {
          id: 'exigence4',
          projectId: 'project1',
          itemId: 'item-inexistant',
          importance: ImportanceLevel.Minor,
          comment: 'Commentaire exigence 4'
        }
      ];
      
      // Le résultat devrait contenir un item par défaut pour l'item non trouvé
      const result = enrichExigencesWithItems(exigencesSansItem, checklistItems);
      expect(result).toHaveLength(1);
      expect(result[0].checklistItem.id).toBe('item-inexistant');
      expect(result[0].checklistItem.consigne).toBe('Item inconnu');
    });
  });
  
  describe('filterExigences', () => {
    it('doit filtrer les exigences par importance', () => {
      const filters = { importance: ImportanceLevel.Major };
      const result = filterExigences(enrichedExigences, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exigence1');
    });
    
    it('doit filtrer les exigences par catégorie', () => {
      const filters = { category: 'UX' };
      const result = filterExigences(enrichedExigences, filters);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('exigence1');
      expect(result[1].id).toBe('exigence3');
    });
    
    it('doit filtrer les exigences par sous-catégorie', () => {
      const filters = { subcategory: 'Performance' };
      const result = filterExigences(enrichedExigences, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exigence2');
    });
    
    it('doit filtrer les exigences par recherche textuelle', () => {
      const filters = { search: 'item 2' };
      const result = filterExigences(enrichedExigences, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exigence2');
    });
    
    it('doit combiner plusieurs filtres', () => {
      const filters = { category: 'UX', importance: ImportanceLevel.Major };
      const result = filterExigences(enrichedExigences, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exigence1');
    });
  });
  
  describe('sortExigences', () => {
    it('doit trier les exigences par importance (décroissante)', () => {
      const result = sortExigences(enrichedExigences, 'importance_desc');
      
      expect(result[0].importance).toBe(ImportanceLevel.Major);
      expect(result[1].importance).toBe(ImportanceLevel.Medium);
      expect(result[2].importance).toBe(ImportanceLevel.NotApplicable);
    });
    
    it('doit trier les exigences par importance (croissante)', () => {
      const result = sortExigences(enrichedExigences, 'importance_asc');
      
      expect(result[0].importance).toBe(ImportanceLevel.NotApplicable);
      expect(result[1].importance).toBe(ImportanceLevel.Medium);
      expect(result[2].importance).toBe(ImportanceLevel.Major);
    });
    
    it('doit trier les exigences par catégorie (A-Z)', () => {
      const result = sortExigences(enrichedExigences, 'category_asc');
      
      expect(result[0].checklistItem?.category).toBe('Technique');
      expect(result[1].checklistItem?.category).toBe('UX');
      expect(result[2].checklistItem?.category).toBe('UX');
    });
    
    it('doit trier les exigences par catégorie (Z-A)', () => {
      const result = sortExigences(enrichedExigences, 'category_desc');
      
      expect(result[0].checklistItem?.category).toBe('UX');
      expect(result[1].checklistItem?.category).toBe('UX');
      expect(result[2].checklistItem?.category).toBe('Technique');
    });
  });
  
  describe('groupExigencesByCategory', () => {
    it('doit regrouper les exigences par catégorie', () => {
      const result = groupExigencesByCategory(enrichedExigences);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['UX']).toHaveLength(2);
      expect(result['Technique']).toHaveLength(1);
    });
    
    it('doit gérer le cas où aucune exigence n\'a de catégorie', () => {
      const exigencesSansCategorie = [
        {
          ...enrichedExigences[0],
          checklistItem: { ...checklistItems[0], category: undefined }
        }
      ];
      
      const result = groupExigencesByCategory(exigencesSansCategorie);
      
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['Non catégorisé']).toHaveLength(1);
    });
  });
  
  describe('countExigencesByImportance', () => {
    it('doit compter les exigences par niveau d\'importance', () => {
      const result = countExigencesByImportance(enrichedExigences);
      
      expect(result[ImportanceLevel.Major]).toBe(1);
      expect(result[ImportanceLevel.Medium]).toBe(1);
      expect(result[ImportanceLevel.NotApplicable]).toBe(1);
      expect(result[ImportanceLevel.Minor]).toBe(0);
      expect(result[ImportanceLevel.Important]).toBe(0);
    });
  });
});
