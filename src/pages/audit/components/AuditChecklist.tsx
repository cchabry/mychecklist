
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Audit, AuditItem, ComplianceStatus } from '@/lib/types';
import { useAuditChecklist } from '../hooks';
import CategoryTabs from './CategoryTabs';
import { enrichItemsWithDetails } from '../utils/itemDetailsUtils';
import ExigenceChecklist from './ExigenceChecklist';

interface AuditChecklistProps {
  audit: Audit;
  onUpdateAudit: (audit: Audit) => void;
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
  
  // Mock data for sample pages
  const [samplePages] = useState([
    { id: '1', url: 'https://example.com/accueil', title: 'Page d\'accueil' },
    { id: '2', url: 'https://example.com/contact', title: 'Contact' },
    { id: '3', url: 'https://example.com/produits', title: 'Liste des produits' }
  ]);
  
  // Exigences mock data
  const [exigences] = useState({
    // Map item ID to importance
    itemImportance: {
      'item1': 'Majeur',
      'item2': 'Important',
      'item3': 'Moyen',
      'item4': 'Mineur',
      'item5': 'N/A'
    }
  });
  
  // Function to get item importance level
  const getItemImportance = (itemId: string) => {
    return exigences.itemImportance[itemId] || 'Non défini';
  };
  
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
          <div className="space-y-8">
            {filteredItems.map((item) => (
              <ExigenceChecklist 
                key={item.id}
                item={item}
                samplePages={samplePages}
                importance={getItemImportance(item.id)}
                onItemChange={handleItemChange}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditChecklist;
