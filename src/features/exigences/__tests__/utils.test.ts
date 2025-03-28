
/**
 * Tests pour les utilitaires d'exigences
 */

import { describe, it, expect } from 'vitest';
import { Exigence, ChecklistItem } from '@/types/domain';
import { ExigenceWithItem } from '../types';
import { enrichExigencesWithItems } from '../utils';
import { ImportanceLevel } from '@/types/enums';

describe('enrichExigencesWithItems', () => {
  it('devrait correctement associer un item de checklist à une exigence', () => {
    // Arrange
    const exigences: Exigence[] = [
      { id: 'exig-1', projectId: 'proj-1', itemId: 'item-1', importance: ImportanceLevel.High, comment: 'Test' }
    ];
    
    const checklistItems: ChecklistItem[] = [
      { 
        id: 'item-1', 
        name: 'Item 1',
        consigne: 'Test consigne', 
        description: 'Test description', 
        category: 'Category 1', 
        subcategory: 'Subcategory 1', 
        reference: ['ref1'], 
        profil: ['dev'], 
        phase: ['phase1'], 
        effort: 3, 
        priority: 2 
      }
    ];
    
    // Act
    const result = enrichExigencesWithItems(exigences, checklistItems);
    
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].checklistItem).toBeDefined();
    expect(result[0].checklistItem?.id).toBe('item-1');
    expect(result[0].checklistItem?.consigne).toBe('Test consigne');
  });
  
  it('devrait renvoyer undefined pour checklistItem si aucun item correspondant n\'est trouvé', () => {
    // Arrange
    const exigences: Exigence[] = [
      { id: 'exig-1', projectId: 'proj-1', itemId: 'item-not-found', importance: ImportanceLevel.High, comment: 'Test' }
    ];
    
    const checklistItems: ChecklistItem[] = [
      { 
        id: 'item-1', 
        name: 'Item 1',
        consigne: 'Test consigne', 
        description: 'Test description', 
        category: 'Category 1', 
        subcategory: 'Subcategory 1', 
        reference: ['ref1'], 
        profil: ['dev'], 
        phase: ['phase1'], 
        effort: 3, 
        priority: 2 
      }
    ];
    
    // Act
    const result = enrichExigencesWithItems(exigences, checklistItems);
    
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].checklistItem).toBeUndefined();
  });
  
  it('devrait gérer les tableaux vides', () => {
    // Arrange
    const exigences: Exigence[] = [];
    const checklistItems: ChecklistItem[] = [
      { 
        id: 'item-1', 
        name: 'Item 1',
        consigne: 'Test consigne', 
        description: 'Test description', 
        category: 'Category 1', 
        subcategory: 'Subcategory 1', 
        reference: ['ref1'], 
        profil: ['dev'], 
        phase: ['phase1'], 
        effort: 3, 
        priority: 2 
      }
    ];
    
    // Act
    const result = enrichExigencesWithItems(exigences, checklistItems);
    
    // Assert
    expect(result).toHaveLength(0);
  });
});
