
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Audit, AuditItem } from '@/lib/types';
import CategoryTabs from './CategoryTabs';
import { enrichItemsWithDetails } from '../utils/itemDetailsUtils';
import ExigenceChecklist from './ExigenceChecklist';
import { Collapsible } from '@/components/ui/collapsible';

interface AuditChecklistProps {
  audit: Audit;
  onUpdateAudit: (audit: Audit) => void;
}

const AuditChecklist: React.FC<AuditChecklistProps> = ({ audit, onUpdateAudit }) => {
  // Ensure all items have details before rendering
  const [checklistReady, setChecklistReady] = useState(false);
  
  // Process audit data on mount
  React.useEffect(() => {
    if (audit && audit.items) {
      const enrichedAudit = {
        ...audit,
        items: enrichItemsWithDetails(audit.items)
      };
      onUpdateAudit(enrichedAudit);
      setChecklistReady(true);
    }
  }, [audit, onUpdateAudit]);
  
  // State for tracking the selected category
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Function to handle item changes
  const handleItemChange = (updatedItem: AuditItem) => {
    if (!audit || !audit.items) return;
    
    const updatedItems = audit.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    const updatedAudit = {
      ...audit,
      items: updatedItems
    };
    
    onUpdateAudit(updatedAudit);
  };
  
  // Function to filter items based on selected category
  const getFilteredItems = () => {
    if (!audit || !audit.items) return [];
    
    if (selectedCategory === 'all') {
      return audit.items;
    }
    
    return audit.items.filter(item => item.category === selectedCategory);
  };
  
  if (!checklistReady) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Mock data for sample pages
  const samplePages = [
    { id: '1', url: 'https://example.com/accueil', title: 'Page d\'accueil' },
    { id: '2', url: 'https://example.com/contact', title: 'Contact' },
    { id: '3', url: 'https://example.com/produits', title: 'Liste des produits' }
  ];
  
  // Exigences mock data
  const exigences = {
    // Map item ID to importance
    itemImportance: {
      'item1': 'Majeur',
      'item2': 'Important',
      'item3': 'Moyen',
      'item4': 'Mineur',
      'item5': 'N/A'
    }
  };
  
  // Function to get item importance level
  const getItemImportance = (itemId: string) => {
    return exigences.itemImportance[itemId] || 'Non défini';
  };
  
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
