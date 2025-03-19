
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Audit, AuditItem, PageResult, ImportanceLevel } from '@/lib/types';
import CategoryTabs from './CategoryTabs';
import { enrichItemsWithDetails } from '../utils/itemDetailsUtils';
import ExigenceChecklist from './ExigenceChecklist';

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
      // Enrichir les items avec des détails et des exigences de projet
      const enrichedAudit = {
        ...audit,
        items: enrichItemsWithDetails(audit.items).map(item => ({
          ...item,
          // Ajouter des données d'exigence de projet (à remplacer par des données réelles)
          importance: item.importance || getDefaultImportance(item.id),
          projectRequirement: item.projectRequirement || getDefaultProjectRequirement(item.id),
          projectComment: item.projectComment || getDefaultProjectComment(item.id)
        }))
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

  // Fonctions pour générer des données de démo sur les exigences du projet
  const getDefaultImportance = (itemId: string): ImportanceLevel => {
    // Exemple de logique pour attribuer une importance basée sur l'ID
    const importances = [
      ImportanceLevel.Majeur,
      ImportanceLevel.Important,
      ImportanceLevel.Moyen,
      ImportanceLevel.Mineur,
      ImportanceLevel.NA
    ];
    const itemNumber = parseInt(itemId.split('-')[1] || '1');
    return importances[itemNumber % importances.length] || ImportanceLevel.Moyen;
  };

  const getDefaultProjectRequirement = (itemId: string): string => {
    // Générer des exigences de projet de démonstration
    const requirements = [
      "Cette exigence est cruciale pour la conformité RGAA du projet.",
      "L'implémentation de cette exigence est nécessaire pour respecter la charte graphique.",
      "Cette exigence est requise par le cahier des charges du client.",
      "Implémentation obligatoire selon les standards internes de qualité.",
      "Exigence critique pour l'accessibilité du projet."
    ];
    
    const itemNumber = parseInt(itemId.split('-')[1] || '1');
    return requirements[itemNumber % requirements.length] || requirements[0];
  };

  const getDefaultProjectComment = (itemId: string): string => {
    // Générer des commentaires de projet de démonstration
    const comments = [
      "Des tests spécifiques doivent être effectués sur toutes les pages principales.",
      "Attention particulière à porter sur les formulaires et les zones interactives.",
      "La conformité à cette exigence impacte directement le SEO du site.",
      "Le client a spécifiquement demandé que cette exigence soit respectée.",
      "Des dérogations peuvent être accordées pour certaines pages administratives."
    ];
    
    const itemNumber = parseInt(itemId.split('-')[1] || '1');
    return comments[itemNumber % comments.length] || comments[0];
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
    { id: 'page-1', url: 'https://example.com/accueil', title: 'Page d\'accueil' },
    { id: 'page-2', url: 'https://example.com/contact', title: 'Contact' },
    { id: 'page-3', url: 'https://example.com/produits', title: 'Liste des produits' }
  ];
  
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
                importance={item.importance || getDefaultImportance(item.id)}
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
