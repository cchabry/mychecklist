
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChecklistItem } from '@/lib/types';

// Données simulées pour le développement
const mockChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    consigne: 'Images avec attribut alt',
    description: 'Toutes les images doivent avoir un attribut alt pertinent',
    category: 'Accessibilité',
    subcategory: 'Images',
    reference: [{ code: 'RGAA 1.1', name: 'RGAA' }],
    profil: ['Développeur'],
    phase: ['Développement'],
    effort: 2,
    priority: 4
  },
  {
    id: '2',
    consigne: 'Contraste de couleurs suffisant',
    description: 'Le contraste entre le texte et l\'arrière-plan doit être suffisant',
    category: 'Accessibilité',
    subcategory: 'Couleurs',
    reference: [{ code: 'RGAA 3.3', name: 'RGAA' }, { code: 'WCAG 1.4.3', name: 'WCAG' }],
    profil: ['UI designer', 'Développeur'],
    phase: ['Design', 'Développement'],
    effort: 3,
    priority: 5
  },
  {
    id: '3',
    consigne: 'Optimisation des images',
    description: 'Les images doivent être optimisées pour le web',
    category: 'Performance',
    subcategory: 'Images',
    reference: [{ code: 'RGESN 4.3', name: 'RGESN' }],
    profil: ['Développeur'],
    phase: ['Développement'],
    effort: 2,
    priority: 3
  }
];

const ChecklistPage = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(mockChecklistItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Extraire toutes les catégories uniques
  const categories = [...new Set(checklistItems.map(item => item.category))];
  
  // Filtrer les items par catégorie si une catégorie est sélectionnée
  const filteredItems = selectedCategory 
    ? checklistItems.filter(item => item.category === selectedCategory)
    : checklistItems;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Référentiel</h1>
        <p className="text-muted-foreground">
          Liste des bonnes pratiques et consignes pour vos audits
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-4 space-y-1">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  Toutes
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <div className="space-y-4">
            {filteredItems.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.consigne}</CardTitle>
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                      {item.category}
                    </div>
                  </div>
                  <CardDescription>{item.subcategory}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Référence</h4>
                      <div className="space-x-1">
                        {item.reference.map((ref, index) => (
                          <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                            {ref.code}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Profil concerné</h4>
                      <div className="space-x-1">
                        {item.profil.map((profile, index) => (
                          <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                            {profile}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Phase</h4>
                      <div className="space-x-1">
                        {item.phase.map((phase, index) => (
                          <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                            {phase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Effort:</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={value}
                            className={`w-2 h-6 mx-0.5 rounded-sm ${
                              value <= item.effort ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Priorité:</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={value}
                            className={`w-2 h-6 mx-0.5 rounded-sm ${
                              value <= item.priority ? 'bg-red-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
