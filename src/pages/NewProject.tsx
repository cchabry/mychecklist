
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notionWriteService } from '@/services/notion/notionWriteService';
import { operationMode } from '@/services/operationMode';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotionRequestLogger } from '@/hooks/useNotionRequestLogger';
import { useCriticalOperation } from '@/hooks/useCriticalOperation';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = React.useState('');
  const [projectUrl, setProjectUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Utiliser le hook d'opération critique pour éviter la bascule en mode démo
  const { executeCritical } = useCriticalOperation('create-project');
  
  // Activer l'interception des requêtes Notion
  useNotionRequestLogger();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Veuillez saisir un nom de projet');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log('🔍 Début de création du projet - Mode démo actif?', operationMode.isDemoMode);
      
      // Utiliser notre hook d'opération critique
      const newProject = await executeCritical(async () => {
        console.log('🔍 Exécution de createProject en tant qu\'opération critique');
        
        return await notionWriteService.createProject({
          name: projectName,
          url: projectUrl,
        });
      });
      
      console.log('🔍 Après création du projet - Mode démo actif?', operationMode.isDemoMode);
      console.log('🔍 Résultat de la création:', newProject);
      
      if (newProject) {
        toast.success('Projet créé avec succès');
        console.log('✅ Projet créé:', newProject);
        
        // Vider le cache des projets pour forcer un rechargement
        localStorage.removeItem('projects_cache');
        
        // Attendre un court instant pour permettre au cache de se vider
        setTimeout(() => {
          console.log('🔍 Redirection vers le projet créé:', newProject.id);
          navigate(`/project/edit/${newProject.id}`);
        }, 500);
      } else {
        console.error('❌ Erreur: Aucun projet retourné par la création');
        throw new Error('Erreur lors de la création du projet');
      }
    } catch (error: any) {
      console.error('❌ Erreur détaillée lors de la création du projet:', error);
      console.error('❌ Stack trace:', error.stack);
      
      if (error.response) {
        console.error('❌ Réponse d\'erreur:', error.response);
      }
      
      toast.error(`Erreur: ${error.message || 'Impossible de créer le projet'}`);
    } finally {
      console.log('🔍 Fin de création du projet - Mode démo actif?', operationMode.isDemoMode);
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
