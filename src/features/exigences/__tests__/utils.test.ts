
/**
 * Tests pour les utilitaires d'exigences
 */

import { describe, it, expect } from 'vitest';
import { enrichExigencesWithItems, filterExigences, sortExigences, formatExigenceComment } from '../utils';
import { Exigence } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';

describe('Exigence Utils', () => {
  const mockExigences: Exigence[] = [
    {
      id: '1',
      projectId: 'proj1',
      itemId: 'item1',
      importance: ImportanceLevel.Major
    },
    {
      id: '2',
      projectId: 'proj1',
      itemId: 'item2',
      importance: ImportanceLevel.Important
    }
  ];

  const mockChecklistItems = [
    {
      id: 'item1',
      name: 'Item 1',
      consigne: 'Première consigne',
      description: 'Description du premier item',
      category: 'Technique',
      subcategory: 'Développement',
      reference: ['RGAA 1.1'],
      profil: ['Développeur'],
      phase: ['Conception'],
      effort: 3,
      priority: 4
    },
    {
      id: 'item2',
      name: 'Item 2',
      consigne: 'Seconde consigne',
      description: 'Description du second item',
      category: 'Design',
      subcategory: 'Accessibilité',
      reference: ['RGAA 2.1'],
      profil: ['Designer'],
      phase: ['Design'],
      effort: 2,
      priority: 3
    }
  ];

  describe('enrichExigencesWithItems', () => {
    it('should enrich exigences with their corresponding checklist items', () => {
      const enriched = enrichExigencesWithItems(mockExigences, mockChecklistItems);
      
      expect(enriched.length).toBe(2);
      expect(enriched[0].checklistItem?.id).toBe('item1');
      expect(enriched[1].checklistItem?.id).toBe('item2');
      expect(enriched[0].checklistItem?.consigne).toBe('Première consigne');
    });
  });

  describe('formatExigenceComment', () => {
    it('should return "Aucun commentaire" for undefined comment', () => {
      const formatted = formatExigenceComment(undefined);
      expect(formatted).toBe('Aucun commentaire');
    });

    it('should return the comment as-is if provided', () => {
      const comment = 'Test comment';
      const formatted = formatExigenceComment(comment);
      expect(formatted).toBe(comment);
    });
  });
});
