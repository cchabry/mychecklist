
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getProjectById } from '@/features/projects';

/**
 * Page d'édition d'un projet existant
 */
const ProjectEditPage = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        const project = await getProjectById(projectId);
        if (project) {
          setFormData({
            name: project.name,
            url: project.url || '',
            description: project.description || ''
          });
        } else {
          setError('Projet non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du projet:', err);
        setError('Impossible de charger les données du projet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Cette fonctionnalité sera implémentée ultérieurement
      // Pour l'instant, on simule une mise à jour réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Projet mis à jour avec succès');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error('Erreur lors de la mise à jour du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader 
          title="Modifier le projet" 
          description="Modifier les informations du projet"
        />
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
          <CardFooter className="border-t p-6">
            <Skeleton className="h-10 w-24 ml-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader 
          title="Erreur" 
          description="Une erreur est survenue"
        />
        <Card className="max-w-2xl mx-auto p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate(`/projects/${projectId}`)}>
            Retour au projet
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Modifier le projet" 
        description="Modifier les informations du projet"
      />
      
      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nom du projet"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL du site *</Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description du projet (optionnelle)"
                rows={4}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/projects/${projectId}`)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ProjectEditPage;
