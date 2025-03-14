
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
    
    // Ajout de détails à certains items pour démonstration
    // (Normalement ces détails viendraient du backend)
    const itemsWithDetails = updatedItems.map(item => {
      // Ajouter des détails à certains items pour démonstration
      if (item.id === updatedItems[0].id && !item.details) {
        return {
          ...item,
          details: "Les pages doivent être accessibles à tous les utilisateurs, incluant ceux qui utilisent des technologies d'assistance. Assurez-vous que tous les éléments interactifs sont accessibles au clavier et portent des étiquettes descriptives."
        };
      }
      if (item.id === updatedItems[2].id && !item.details) {
        return {
          ...item,
          details: "Les liens doivent avoir un contraste suffisant et être facilement identifiables. Ils devraient se distinguer du texte normal par le style, la couleur ou le soulignement."
        };
      }
      return item;
    });
    
    onUpdateAudit({
      ...audit,
      items: itemsWithDetails,
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
    <div className="bg-white/80 backdrop-blur-md rounded-lg border border-tmw-blue/10 shadow-lg p-6">
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-tmw-darkgray">
            <span className="inline-block mr-2 bg-gradient-to-r from-tmw-blue to-tmw-purple bg-clip-text text-transparent">
              Critères d'audit
            </span>
          </h2>
          <TabsList className="bg-tmw-gray rounded-lg p-1 border border-tmw-blue/10">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-tmw-blue data-[state=active]:shadow-sm"
            >
              Tous
            </TabsTrigger>
            {CATEGORIES.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:bg-white data-[state=active]:text-tmw-blue data-[state=active]:shadow-sm"
              >
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
    </div>
  );
};

export default AuditChecklist;
