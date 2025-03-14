
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChecklistItem from '@/components/ChecklistItem';
import { Audit, AuditItem, ComplianceStatus, COMPLIANCE_VALUES } from '@/lib/types';
import { CATEGORIES } from '@/lib/mockData';

interface AuditChecklistProps {
  audit: Audit;
  onUpdateAudit: (audit: Audit) => void;
}

const AuditChecklist: React.FC<AuditChecklistProps> = ({ audit, onUpdateAudit }) => {
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
    
    onUpdateAudit({
      ...audit,
      items: updatedItems,
      score,
      updatedAt: new Date().toISOString()
    });
  };
  
  const getFilteredItems = () => {
    return selectedCategory === 'all' 
      ? audit.items 
      : audit.items.filter(item => item.category === selectedCategory);
  };
  
  const filteredItems = getFilteredItems();
  
  return (
    <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Critères d'audit</h2>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          {CATEGORIES.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      <TabsContent value={selectedCategory} className="mt-0">
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ChecklistItem 
                item={item} 
                onChange={handleItemChange} 
              />
            </motion.div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AuditChecklist;
