
import React, { useState } from 'react';
import { useExigences } from '@/hooks/useExigences';
import { useChecklist } from '@/hooks/useChecklist';
import { ImportanceLevel, ChecklistItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExigencesListProps {
  projectId: string;
}

const ExigencesList: React.FC<ExigencesListProps> = ({ projectId }) => {
  const { exigences, loading, error, loadExigences, saveExigence } = useExigences(projectId);
  const { items: checklistItems, loading: loadingChecklist } = useChecklist();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState<string>('');

  // Obtenir les catégories uniques
  const categories = ['all', ...new Set(checklistItems.map(item => item.category))];

  // Filtrer les items par catégorie
  const filteredItems = selectedCategory === 'all' 
    ? checklistItems 
    : checklistItems.filter(item => item.category === selectedCategory);

  // Obtenir l'importance d'un item
  const getImportanceLevel = (itemId: string): ImportanceLevel => {
    const exigence = exigences.find(e => e.itemId === itemId);
    return exigence?.importance || ImportanceLevel.NA;
  };

  // Obtenir le commentaire d'un item
  const getComment = (itemId: string): string => {
    const exigence = exigences.find(e => e.itemId === itemId);
    return exigence?.comment || '';
  };

  // Gérer le changement d'importance
  const handleImportanceChange = async (itemId: string, importance: ImportanceLevel) => {
    const exigence = exigences.find(e => e.itemId === itemId);
    
    if (exigence) {
      await saveExigence({
        ...exigence,
        importance
      });
    } else {
      await saveExigence({
        id: 'new',
        projectId,
        itemId,
        importance,
        comment: ''
      });
    }
  };

  // Commencer l'édition d'un commentaire
  const startEditingComment = (itemId: string) => {
    setEditingItemId(itemId);
    setEditComment(getComment(itemId));
  };

  // Sauvegarder le commentaire
  const saveComment = async () => {
    if (!editingItemId) return;

    const exigence = exigences.find(e => e.itemId === editingItemId);
    
    if (exigence) {
      await saveExigence({
        ...exigence,
        comment: editComment
      });
    } else {
      await saveExigence({
        id: 'new',
        projectId,
        itemId: editingItemId,
        importance: ImportanceLevel.NA,
        comment: editComment
      });
    }

    setEditingItemId(null);
    setEditComment('');
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditComment('');
  };

  // Rendu conditionnel en fonction du chargement
  if (loading || loadingChecklist) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Erreur</h3>
        <p>{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => loadExigences(true)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  // Couleur du badge en fonction du niveau d'importance
  const getImportanceBadgeColor = (importance: ImportanceLevel) => {
    switch (importance) {
      case ImportanceLevel.Majeur:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case ImportanceLevel.Important:
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case ImportanceLevel.Moyen:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case ImportanceLevel.Mineur:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Exigences du projet</h2>
        <Button 
          variant="outline" 
          onClick={() => loadExigences(true)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="mb-4 flex flex-wrap">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category === 'all' ? 'Toutes' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.consigne}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className="mr-1">{item.category}</Badge>
                      {item.subcategory && (
                        <Badge variant="outline" className="mr-1">{item.subcategory}</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="min-w-[200px]">
                    <Select
                      defaultValue={getImportanceLevel(item.id)}
                      onValueChange={(value) => handleImportanceChange(item.id, value as ImportanceLevel)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Importance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ImportanceLevel.NA}>N/A</SelectItem>
                        <SelectItem value={ImportanceLevel.Mineur}>Mineur</SelectItem>
                        <SelectItem value={ImportanceLevel.Moyen}>Moyen</SelectItem>
                        <SelectItem value={ImportanceLevel.Important}>Important</SelectItem>
                        <SelectItem value={ImportanceLevel.Majeur}>Majeur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-4 text-sm text-gray-600">{item.description}</p>
                
                {editingItemId === item.id ? (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Commentaire spécifique pour ce projet..."
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveComment}>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Commentaire pour ce projet:</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => startEditingComment(item.id)}
                      >
                        Modifier
                      </Button>
                    </div>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm min-h-[40px]">
                      {getComment(item.id) || 'Aucun commentaire spécifique'}
                    </p>
                  </div>
                )}
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.requirementLevel && (
                    <Badge variant="outline">
                      {item.requirementLevel}
                    </Badge>
                  )}
                  <Badge className={getImportanceBadgeColor(getImportanceLevel(item.id))}>
                    {getImportanceLevel(item.id)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExigencesList;
