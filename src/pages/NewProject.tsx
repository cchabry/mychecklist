
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = React.useState('');
  const [projectUrl, setProjectUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [projectsDbConfigured, setProjectsDbConfigured] = React.useState(true);

  // Vérifier si la base de données des projets est configurée
  React.useEffect(() => {
    const dbId = localStorage.getItem('notion_database_id');
    setProjectsDbConfigured(!!dbId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Veuillez saisir un nom de projet');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Vérifier si la base de données des projets est configurée
      if (!projectsDbConfigured && !operationMode.isDemoMode) {
        toast.warning("Base de données des projets non configurée", {
          description: "Le mode démo sera utilisé pour cette opération."
        });
        
        // Activer le mode démo pour cette opération
        operationMode.enableDemoMode("Base de données des projets non configurée");
      }
      
      console.log(`Création du projet : ${projectName} (${projectUrl})`);
      console.log(`Mode démo: ${operationMode.isDemoMode}`);
      
      const newProject = await notionApi.createProject({
        name: projectName,
        url: projectUrl,
      });
      
      toast.success('Projet créé avec succès');
      navigate(`/project/edit/${newProject.id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création du projet:', error);
      
      // Message d'erreur détaillé et adapté
      let errorMessage = error.message || 'Impossible de créer le projet';
      
      if (errorMessage.includes('403')) {
        errorMessage = "Permission refusée. Vérifiez que votre clé API Notion a accès à cette base de données.";
      } else if (errorMessage.includes('404')) {
        errorMessage = "Base de données introuvable. Vérifiez l'ID de la base de données.";
      }
      
      toast.error(`Erreur: ${errorMessage}`);
      
      // Si erreur d'autorisation, suggérer d'activer le mode démo
      if (errorMessage.includes('Permission') || errorMessage.includes('403')) {
        toast.info("Vous pouvez passer en mode démo pour tester l'application sans API Notion");
      }
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
            {!projectsDbConfigured && !operationMode.isDemoMode && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Base de données non configurée</AlertTitle>
                <AlertDescription>
                  La base de données des projets n'est pas configurée dans Notion.
                  Le mode démo sera utilisé.
                </AlertDescription>
              </Alert>
            )}
            
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
                  placeholder="https://exemple.com"
                  type="url"
                />
              </div>
              
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Création en cours...' : 'Créer le projet'}
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
