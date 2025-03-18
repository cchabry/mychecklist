
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Audit } from '@/lib/types';
import { useAuditChecklist } from '../hooks/useAuditChecklist';
import CategoryTabs from './CategoryTabs';
import ChecklistItemList from './ChecklistItemList';
import { enrichItemsWithDetails } from '../utils/itemDetailsUtils';

interface AuditChecklistProps {
  audit: Audit;
  onUpdateAudit: (audit: Audit) => void; // Changed from onUpdateAudit to match container
}

const AuditChecklist: React.FC<AuditChecklistProps> = ({ audit, onUpdateAudit }) => {
  // Ensure all items have details before rendering
  if (audit && audit.items && audit.items.some(item => !item.details)) {
    const enrichedAudit = {
      ...audit,
      items: enrichItemsWithDetails(audit.items)
    };
    onUpdateAudit(enrichedAudit);
    return null; // Return null to avoid rendering with incomplete data
  }
  
  const {
    selectedCategory,
    setSelectedCategory,
    handleItemChange,
    getFilteredItems
  } = useAuditChecklist(audit, onUpdateAudit);
  
  const filteredItems = getFilteredItems();
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg border border-tmw-blue/10 shadow-lg p-6">
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-tmw-darkgray">
            <span className="inline-block mr-2 bg-gradient-to-r from-tmw-blue to-tmw-purple bg-clip-text text-transparent">
              Critères d'audit
            </span>
          </h2>
          <CategoryTabs selectedCategory={selectedCategory} />
        </div>
        
        <TabsContent value={selectedCategory} className="mt-0">
          <ChecklistItemList 
            items={filteredItems}
            onItemChange={handleItemChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditChecklist;
