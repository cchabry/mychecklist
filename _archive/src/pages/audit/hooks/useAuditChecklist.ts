
import { useState } from 'react';
import { Audit, AuditItem, ComplianceStatus, COMPLIANCE_VALUES } from '@/lib/types';
import { enrichItemsWithDetails } from '../utils/itemDetailsUtils';

export const useAuditChecklist = (
  audit: Audit,
  onUpdateAudit: (audit: Audit) => void
) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const handleItemChange = (itemId: string, status: ComplianceStatus, comment?: string) => {
    const updatedItems = audit.items.map(item => 
      item.id === itemId 
        ? { ...item, status, comment } 
        : item
    );
    
    // Recalculer le score
    const evaluatedItems = updatedItems.filter(
      item => item.status !== ComplianceStatus.NotEvaluated
    );
    
    let score = 0;
    if (evaluatedItems.length > 0) {
      const totalPossiblePoints = evaluatedItems.length;
      const earnedPoints = evaluatedItems.reduce(
        (sum, item) => sum + COMPLIANCE_VALUES[item.status], 
        0
      );
      score = Math.round((earnedPoints / totalPossiblePoints) * 100);
    }
    
    // Add details to all items
    const enrichedItems = enrichItemsWithDetails(updatedItems);
    
    onUpdateAudit({
      ...audit,
      items: enrichedItems,
      score,
      updatedAt: new Date().toISOString()
    });
  };
  
  const getFilteredItems = () => {
    return selectedCategory === 'all' 
      ? audit.items 
      : audit.items.filter(item => item.category === selectedCategory);
  };
  
  return {
    selectedCategory,
    setSelectedCategory,
    handleItemChange,
    getFilteredItems
  };
};
