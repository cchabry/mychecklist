
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const NewProjectPage = () => {
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simuler la création d'un projet
    toast.success('Projet créé avec succès');
    navigate('/');
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nouveau projet</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Créer un projet</CardTitle>
          <CardDescription>
            Saisissez les informations de base de votre nouveau projet d'audit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom du projet
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full p-2 border rounded-md"
                placeholder="Exemple: Site web corporate"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                URL du site
              </label>
              <input
                id="url"
                type="url"
                required
                className="w-full p-2 border rounded-md"
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground">
                L'URL principale du site web qui sera audité
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Description du projet..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link to="/">Annuler</Link>
              </Button>
              <Button type="submit">Créer le projet</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProjectPage;
