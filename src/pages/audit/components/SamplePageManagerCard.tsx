
import React, { useState } from 'react';
import { SamplePage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, X, Edit2, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  className
}) => {
  const [newPageUrl, setNewPageUrl] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SamplePage>>({});

  // Fonction pour ajouter une nouvelle page
  const handleAddPage = () => {
    if (!newPageUrl) {
      toast.error("L'URL de la page est requise");
      return;
    }

    if (!newPageTitle) {
      // Si le titre n'est pas fourni, utiliser l'URL comme titre
      setNewPageTitle(new URL(newPageUrl).pathname || 'Nouvelle page');
    }

    // Ajouter la nouvelle page
    onAddPage({
      url: newPageUrl,
      title: newPageTitle,
      description: newPageDescription,
      order: pages.length + 1,
      projectId: ''  // Sera remplacé par l'ID du projet dans le hook parent
    });

    // Réinitialiser le formulaire
    setNewPageUrl('');
    setNewPageTitle('');
    setNewPageDescription('');

    toast.success("Page ajoutée à l'échantillon");
  };

  // Fonction pour commencer l'édition d'une page
  const startEditing = (page: SamplePage) => {
    setEditingPageId(page.id);
    setEditFormData({
      url: page.url,
      title: page.title,
      description: page.description
    });
  };

  // Fonction pour annuler l'édition
  const cancelEditing = () => {
    setEditingPageId(null);
    setEditFormData({});
  };

  // Fonction pour sauvegarder les modifications
  const saveEditing = (pageId: string) => {
    if (!editFormData.url) {
      toast.error("L'URL de la page est requise");
      return;
    }

    onUpdatePage(pageId, editFormData);
    setEditingPageId(null);
    setEditFormData({});
    toast.success("Page mise à jour");
  };

  // Validation de l'URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-xl">Échantillon de pages</CardTitle>
        <CardDescription>
          Définissez l'ensemble des pages qui seront évaluées dans cet audit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Liste des pages existantes */}
        {pages.length > 0 ? (
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-medium">
              Pages dans l'échantillon ({pages.length})
            </h3>
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-white border border-slate-200 rounded-md p-3 flex items-start justify-between"
                >
                  {editingPageId === page.id ? (
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label htmlFor={`edit-url-${page.id}`} className="text-xs mb-1 block">
                          URL
                        </Label>
                        <Input
                          id={`edit-url-${page.id}`}
                          value={editFormData.url}
                          onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-title-${page.id}`} className="text-xs mb-1 block">
                          Titre
                        </Label>
                        <Input
                          id={`edit-title-${page.id}`}
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-desc-${page.id}`} className="text-xs mb-1 block">
                          Description
                        </Label>
                        <Textarea
                          id={`edit-desc-${page.id}`}
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveEditing(page.id)}
                          disabled={!editFormData.url}
                        >
                          <Save size={14} className="mr-1" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-slate-800">
                            {page.title || "Sans titre"}
                          </h4>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-1">
                          {page.url}
                        </div>
                        {page.description && (
                          <div className="text-sm text-slate-700 mt-2">
                            {page.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center ml-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(page)}
                          className="h-7 w-7"
                        >
                          <Edit2 size={15} className="text-slate-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            onRemovePage(page.id);
                            toast.info("Page supprimée de l'échantillon");
                          }}
                          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <X size={15} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-6 text-center mb-6">
            <p className="text-slate-600">
              Aucune page dans l'échantillon. Ajoutez des pages pour commencer l'audit.
            </p>
          </div>
        )}

        {/* Formulaire d'ajout de page */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-medium mb-3">Ajouter une page</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="page-url" className="text-xs mb-1 block">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="page-url"
                value={newPageUrl}
                onChange={(e) => setNewPageUrl(e.target.value)}
                placeholder="https://example.com/page"
                className={`${
                  newPageUrl && !isValidUrl(newPageUrl) ? "border-red-300" : ""
                }`}
              />
              {newPageUrl && !isValidUrl(newPageUrl) && (
                <p className="text-xs text-red-500 mt-1">URL invalide</p>
              )}
            </div>
            <div>
              <Label htmlFor="page-title" className="text-xs mb-1 block">
                Titre
              </Label>
              <Input
                id="page-title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Titre de la page"
              />
            </div>
            <div>
              <Label htmlFor="page-description" className="text-xs mb-1 block">
                Description (optionnelle)
              </Label>
              <Textarea
                id="page-description"
                value={newPageDescription}
                onChange={(e) => setNewPageDescription(e.target.value)}
                placeholder="Description ou contexte de la page"
                rows={2}
              />
            </div>
            <Button
              onClick={handleAddPage}
              disabled={!newPageUrl || !isValidUrl(newPageUrl)}
              className="w-full"
            >
              <PlusCircle size={16} className="mr-2" />
              Ajouter à l'échantillon
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SamplePageManagerCard;
