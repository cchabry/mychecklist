
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
    
    // Ajouter des détails à tous les items
    const enrichedItems = updatedItems.map(item => {
      // Item 1-5 already have details from previous implementation
      if (item.id === "item-1" && !item.details) {
        return {
          ...item,
          details: "Vérifiez que toutes les images ont des attributs 'alt' descriptifs qui expliquent le contenu de l'image pour les utilisateurs de lecteurs d'écran."
        };
      }
      if (item.id === "item-2" && !item.details) {
        return {
          ...item,
          details: "Les pages doivent être accessibles à tous les utilisateurs, incluant ceux qui utilisent des technologies d'assistance. Assurez-vous que tous les éléments interactifs sont accessibles au clavier et portent des étiquettes descriptives."
        };
      }
      if (item.id === "item-3" && !item.details) {
        return {
          ...item,
          details: "Les liens doivent avoir un contraste suffisant et être facilement identifiables. Ils devraient se distinguer du texte normal par le style, la couleur ou le soulignement."
        };
      }
      if (item.id === "item-4" && !item.details) {
        return {
          ...item,
          details: "Assurez-vous que les pages se chargent rapidement. Optimisez les ressources, réduisez le nombre de requêtes HTTP et utilisez la mise en cache appropriée pour améliorer les performances."
        };
      }
      if (item.id === "item-5" && !item.details) {
        return {
          ...item,
          details: "Réduisez la taille des images sans compromettre la qualité visuelle. Utilisez le format d'image approprié (WebP, JPEG, PNG) selon le cas d'utilisation et appliquez une compression adéquate."
        };
      }
      if (item.id === "item-6" && !item.details) {
        return {
          ...item,
          details: "Structurez le contenu avec des balises de titre appropriées. Utilisez h1 pour le titre principal de la page, puis h2, h3, etc. pour les sous-sections, en respectant la hiérarchie."
        };
      }
      if (item.id === "item-7" && !item.details) {
        return {
          ...item,
          details: "Chaque page doit avoir une meta description unique, concise (120-158 caractères) et pertinente qui résume le contenu de la page pour les moteurs de recherche."
        };
      }
      if (item.id === "item-8" && !item.details) {
        return {
          ...item,
          details: "Le site doit s'adapter à différentes tailles d'écran sans perte de fonctionnalité. Testez sur différents appareils et assurez-vous que les éléments interactifs fonctionnent correctement sur mobile."
        };
      }
      if (item.id === "item-9" && !item.details) {
        return {
          ...item,
          details: "Assurez-vous que toutes les pages utilisent HTTPS. Vérifiez que le certificat SSL est valide, correctement configuré et n'expire pas prochainement."
        };
      }
      if (item.id === "item-10" && !item.details) {
        return {
          ...item,
          details: "La navigation du site doit être cohérente et intuitive. Les utilisateurs doivent pouvoir facilement comprendre où ils se trouvent et comment naviguer vers d'autres sections."
        };
      }
      if (item.id === "item-11" && !item.details) {
        return {
          ...item,
          details: "Les formulaires doivent indiquer clairement quels champs sont obligatoires et fournir des messages d'erreur spécifiques et utiles. Validez les entrées côté client et côté serveur."
        };
      }
      if (item.id === "item-12" && !item.details) {
        return {
          ...item,
          details: "Configurez des en-têtes CSP appropriés pour protéger contre les attaques XSS. Définissez des politiques strictes qui n'autorisent que les ressources nécessaires de sources fiables."
        };
      }
      if (item.id === "item-13" && !item.details) {
        return {
          ...item,
          details: "Utilisez des balises HTML5 sémantiques comme <header>, <nav>, <main>, <section>, <article> et <footer> pour structurer le contenu de manière logique et accessible."
        };
      }
      if (item.id === "item-14" && !item.details) {
        return {
          ...item,
          details: "Vérifiez régulièrement tous les liens internes et externes pour vous assurer qu'ils mènent à des pages actives. Mettez en place une stratégie pour gérer les liens rompus."
        };
      }
      if (item.id === "item-15" && !item.details) {
        return {
          ...item,
          details: "Testez le site sur les principaux navigateurs (Chrome, Firefox, Safari, Edge) et leurs versions récentes. Assurez-vous que l'apparence et les fonctionnalités sont cohérentes."
        };
      }
      return item;
    });
    
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
