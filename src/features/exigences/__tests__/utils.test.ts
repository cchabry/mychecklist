
/**
 * Tests pour les utilitaires d'exigences
 */

import { describe, it, expect } from 'vitest';
import { calculateImportancePercentage, enrichExigencesWithItems } from '../utils';
import { ImportanceLevel } from '@/types/enums';
import { Exigence } from '@/types/domain';
import { ChecklistItem } from '@/features/checklist/types';

describe('Exigence Utils', () => {
  describe('calculateImportancePercentage', () => {
    it('should return empty object for empty exigences array', () => {
      const result = calculateImportancePercentage([]);
      expect(result).toEqual({});
    });
    
    it('should calculate correct percentages', () => {
      const exigences = [
        { id: '1', projectId: 'p1', itemId: 'i1', importance: ImportanceLevel.Major },
        { id: '2', projectId: 'p1', itemId: 'i2', importance: ImportanceLevel.Major },
        { id: '3', projectId: 'p1', itemId: 'i3', importance: ImportanceLevel.Medium },
        { id: '4', projectId: 'p1', itemId: 'i4', importance: ImportanceLevel.Minor }
      ] as Exigence[];
      
      const result = calculateImportancePercentage(exigences);
      
      expect(result[ImportanceLevel.Major]).toBe(50);
      expect(result[ImportanceLevel.Medium]).toBe(25);
      expect(result[ImportanceLevel.Minor]).toBe(25);
      expect(result[ImportanceLevel.NA]).toBe(0);
      expect(result[ImportanceLevel.Important]).toBe(0);
    });
  });
  
  describe('enrichExigencesWithItems', () => {
    it('should associate items with exigences', () => {
      const exigences = [
        { id: '1', projectId: 'p1', itemId: 'item-1', importance: ImportanceLevel.Major },
        { id: '2', projectId: 'p1', itemId: 'item-2', importance: ImportanceLevel.Medium }
      ] as Exigence[];
      
      const items = [
        { id: 'item-1', name: 'Item 1', consigne: 'Consigne 1', category: 'Cat 1' },
        { id: 'item-2', name: 'Item 2', consigne: 'Consigne 2', category: 'Cat 2' },
        { id: 'item-3', name: 'Item 3', consigne: 'Consigne 3', category: 'Cat 3' }
      ] as ChecklistItem[];
      
      const result = enrichExigencesWithItems(exigences, items);
      
      expect(result[0].item).toBeDefined();
      expect(result[0].item?.id).toBe('item-1');
      expect(result[0].item?.name).toBe('Item 1');
      
      expect(result[1].item).toBeDefined();
      expect(result[1].item?.id).toBe('item-2');
      expect(result[1].item?.name).toBe('Item 2');
    });
    
    it('should handle missing items gracefully', () => {
      const exigences = [
        { id: '1', projectId: 'p1', itemId: 'non-existent', importance: ImportanceLevel.Major }
      ] as Exigence[];
      
      const items = [
        { id: 'item-1', name: 'Item 1', consigne: 'Consigne 1', category: 'Cat 1' }
      ] as ChecklistItem[];
      
      const result = enrichExigencesWithItems(exigences, items);
      
      expect(result[0].item).toBeUndefined();
    });
  });
});
