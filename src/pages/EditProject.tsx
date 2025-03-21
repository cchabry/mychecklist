
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { cleanProjectId } from '@/lib/utils';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cleanedId = cleanProjectId(id);

  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!cleanedId) {
        setError("ID de projet invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const project = await notionApi.getProject(cleanedId);
        
        if (!project) {
          setError("Projet non trouvé");
          return;
        }
        
        setProjectName(project.name || '');
        setProjectUrl(project.url || '');
        setError(null);
      } catch (err: any) {
        console.error(`Erreur lors du chargement du projet ${cleanedId}:`, err);
        setError(err.message || "Impossible de charger le projet");
        toast.error("Erreur lors du chargement du projet");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [cleanedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Veuillez saisir un nom de projet');
      return;
    }
    
    if (!cleanedId) {
      toast.error('ID de projet invalide');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await notionApi.updateProject(cleanedId, {
        name: projectName,
        url: projectUrl,
      });
      
      toast.success('Projet mis à jour avec succès');
      navigate('/');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le projet'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto animate-pulse">
            <CardContent className="p-6 h-48"></CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <div className="flex justify-end">
                <Button onClick={() => navigate('/')}>
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Modifier le projet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nom du projet *</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nom du projet"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectUrl">URL du site (optionnel)</Label>
                <Input
                  id="projectUrl"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditProject;
