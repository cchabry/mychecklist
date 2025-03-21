
import React, { useState } from 'react';
import { SamplePage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, X, Check, Globe, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';

interface SamplePageManagerCardProps {
  pages: SamplePage[];
  onAddPage: (page: Omit<SamplePage, 'id'>) => void;
  onRemovePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<SamplePage>) => void;
  className?: string;
}

const SamplePageManagerCard: React.FC<SamplePageManagerCardProps> = ({
  pages,
  onAddPage,
  onRemovePage,
  onUpdatePage,
  className = ''
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPage, setNewPage] = useState<Omit<SamplePage, 'id'>>({
    projectId: '',
    url: '',
    title: '',
    description: '',
    order: 0
  });
  const [editPage, setEditPage] = useState<SamplePage | null>(null);

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewPage({
      projectId: pages[0]?.projectId || '',
      url: '',
      title: '',
      description: '',
      order: pages.length + 1
    });
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleSubmitNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPage.title || !newPage.url) {
      toast.error("Informations manquantes", {
        description: "Le titre et l'URL sont obligatoires."
      });
      return;
    }
    
    onAddPage(newPage);
    setShowAddForm(false);
    toast.success("Page ajoutée", {
      description: `La page "${newPage.title}" a été ajoutée à l'échantillon.`
    });
    
    setNewPage({
      projectId: pages[0]?.projectId || '',
      url: '',
      title: '',
      description: '',
      order: pages.length + 1
    });
  };

  const handleStartEditing = (page: SamplePage) => {
    setEditingPageId(page.id);
    setEditPage({ ...page });
  };

  const handleCancelEdit = () => {
    setEditingPageId(null);
    setEditPage(null);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editPage || !editingPageId) return;
    
    if (!editPage.title || !editPage.url) {
      toast.error("Informations manquantes", {
        description: "Le titre et l'URL sont obligatoires."
      });
      return;
    }
    
    onUpdatePage(editingPageId, editPage);
    setEditingPageId(null);
    setEditPage(null);
    toast.success("Page mise à jour", {
      description: `La page "${editPage.title}" a été mise à jour.`
    });
  };

  const handleMoveUp = (pageId: string) => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex <= 0) return; // Déjà en haut
    
    const page = pages[pageIndex];
    const prevPage = pages[pageIndex - 1];
    
    onUpdatePage(page.id, { order: prevPage.order });
    onUpdatePage(prevPage.id, { order: page.order });
  };

  const handleMoveDown = (pageId: string) => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex >= pages.length - 1 || pageIndex < 0) return; // Déjà en bas
    
    const page = pages[pageIndex];
    const nextPage = pages[pageIndex + 1];
    
    onUpdatePage(page.id, { order: nextPage.order });
    onUpdatePage(nextPage.id, { order: page.order });
  };

  // Tri des pages par ordre
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pages de l'échantillon</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddClick}
            className="ml-auto"
            disabled={showAddForm}
          >
            <Plus className="mr-1 h-4 w-4" />
            Ajouter une page
          </Button>
        </CardTitle>
        <CardDescription>
          Gérez les pages web qui composeront l'échantillon pour cet audit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleSubmitNewPage} className="border p-4 rounded-md mb-4">
            <h4 className="font-medium mb-3">Ajouter une nouvelle page</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title" 
                  value={newPage.title} 
                  onChange={e => setNewPage({...newPage, title: e.target.value})}
                  placeholder="Accueil, Contact, À propos..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  value={newPage.url} 
                  onChange={e => setNewPage({...newPage, url: e.target.value})}
                  placeholder="https://exemple.com/page"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea 
                  id="description" 
                  value={newPage.description} 
                  onChange={e => setNewPage({...newPage, description: e.target.value})}
                  placeholder="Informations sur cette page..."
                  rows={2}
                />
              </div>
              <div className="flex space-x-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancelAdd}>
                  <X className="mr-1 h-4 w-4" />
                  Annuler
                </Button>
                <Button type="submit">
                  <Check className="mr-1 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {sortedPages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>Aucune page dans l'échantillon</p>
            <p className="text-sm">Ajoutez des pages pour commencer votre audit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPages.map(page => (
              <div 
                key={page.id} 
                className="border rounded-md p-3 transition-all hover:bg-muted/30"
              >
                {editingPageId === page.id ? (
                  <form onSubmit={handleSubmitEdit}>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`edit-title-${page.id}`}>Titre</Label>
                        <Input 
                          id={`edit-title-${page.id}`}
                          value={editPage?.title || ''}
                          onChange={e => setEditPage({...editPage!, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-url-${page.id}`}>URL</Label>
                        <Input 
                          id={`edit-url-${page.id}`}
                          value={editPage?.url || ''}
                          onChange={e => setEditPage({...editPage!, url: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-desc-${page.id}`}>Description</Label>
                        <Textarea 
                          id={`edit-desc-${page.id}`}
                          value={editPage?.description || ''}
                          onChange={e => setEditPage({...editPage!, description: e.target.value})}
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-2 justify-end">
                        <Button type="button" variant="outline" onClick={handleCancelEdit}>
                          <X className="mr-1 h-4 w-4" />
                          Annuler
                        </Button>
                        <Button type="submit">
                          <Check className="mr-1 h-4 w-4" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{page.title}</h4>
                        <a 
                          href={page.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {page.url}
                        </a>
                        {page.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {page.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveUp(page.id)}
                          disabled={page.order <= 1}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveDown(page.id)}
                          disabled={page.order >= pages.length}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleStartEditing(page)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (window.confirm(`Supprimer la page "${page.title}" de l'échantillon ?`)) {
                              onRemovePage(page.id);
                              toast.success("Page supprimée", {
                                description: `La page "${page.title}" a été retirée de l'échantillon.`
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {pages.length > 0 && (
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {pages.length} page{pages.length > 1 ? 's' : ''} dans l'échantillon
          </div>
          {!showAddForm && (
            <Button size="sm" variant="outline" onClick={handleAddClick}>
              <Plus className="mr-1 h-4 w-4" />
              Ajouter une page
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default SamplePageManagerCard;
