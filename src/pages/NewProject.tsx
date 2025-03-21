
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = React.useState('');
  const [projectUrl, setProjectUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Veuillez saisir un nom de projet');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const newProject = await notionApi.createProject({
        name: projectName,
        url: projectUrl,
      });
      
      toast.success('Projet créé avec succès');
      navigate(`/project/edit/${newProject.id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création du projet:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de créer le projet'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Nouveau projet</CardTitle>
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
                  {isSubmitting ? 'Création...' : 'Créer le projet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewProject;
