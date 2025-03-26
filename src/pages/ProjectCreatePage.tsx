
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createProject } from '@/features/projects';

/**
 * Page de création d'un nouveau projet
 */
const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });

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
      const newProject = await createProject({
        name: formData.name,
        url: formData.url,
        description: formData.description
      });
      
      toast.success('Projet créé avec succès');
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      toast.error('Erreur lors de la création du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader 
        title="Créer un nouveau projet" 
        description="Créez un nouveau projet pour démarrer un audit"
      />
      
      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl mx-auto bg-white/90">
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
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? 'Création...' : 'Créer le projet'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ProjectCreatePage;
