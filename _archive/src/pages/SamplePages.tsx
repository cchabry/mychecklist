
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash, ExternalLink, ArrowLeft } from 'lucide-react';
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Separator
} from '@/components/ui/';
import Header from '@/components/Header';
import { toast } from 'sonner';

interface SamplePage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

const SamplePagesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // Simuler un projet avec quelques données
  const [project] = useState({
    id: projectId || 'demo',
    name: 'Projet de démonstration',
    url: 'https://example.com'
  });
  
  // État pour les pages d'échantillon
  const [samplePages, setSamplePages] = useState<SamplePage[]>([
    { id: '1', url: 'https://example.com/accueil', title: 'Page d\'accueil' },
    { id: '2', url: 'https://example.com/contact', title: 'Contact' },
    { id: '3', url: 'https://example.com/produits', title: 'Liste des produits' }
  ]);
  
  // État pour le formulaire d'ajout de page
  const [newPage, setNewPage] = useState<{url: string, title: string, description: string}>({
    url: '',
    title: '',
    description: ''
  });
  
  // Ajouter une nouvelle page
  const handleAddPage = () => {
    if (!newPage.url || !newPage.title) {
      toast.error('URL et titre requis');
      return;
    }
    
    // Ajouter la page
    const newId = (samplePages.length + 1).toString();
    setSamplePages([...samplePages, { 
      id: newId, 
      url: newPage.url,
      title: newPage.title,
      description: newPage.description 
    }]);
    
    // Réinitialiser le formulaire
    setNewPage({ url: '', title: '', description: '' });
    
    toast.success('Page ajoutée à l\'échantillon');
  };
  
  // Supprimer une page
  const handleDeletePage = (id: string) => {
    setSamplePages(samplePages.filter(page => page.id !== id));
    toast.success('Page supprimée de l\'échantillon');
  };
  
  return (
    <div className="mx-auto max-w-screen-xl">
      <Header />
      
      <main className="container px-4 py-6 md:py-10">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </Button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              Gestion des pages d'échantillon pour l'audit
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pages d'échantillon</CardTitle>
              </CardHeader>
              <CardContent>
                {samplePages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune page dans l'échantillon</p>
                    <p className="text-sm mt-2">Ajoutez des pages en utilisant le formulaire</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {samplePages.map((page) => (
                      <div key={page.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{page.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <a 
                              href={page.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-500 transition-colors"
                            >
                              {page.url}
                              <ExternalLink size={12} className="ml-1" />
                            </a>
                          </div>
                          {page.description && (
                            <p className="text-sm mt-1">{page.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/projet/${projectId || 'demo'}`)}
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    onClick={() => navigate(`/audit/${projectId || 'demo'}`)}
                    disabled={samplePages.length === 0}
                  >
                    Commencer l'audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL de la page</label>
                    <Input 
                      placeholder="https://example.com/page" 
                      value={newPage.url}
                      onChange={(e) => setNewPage({...newPage, url: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titre</label>
                    <Input 
                      placeholder="Titre de la page" 
                      value={newPage.title}
                      onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (optionnelle)</label>
                    <Input 
                      placeholder="Description ou contexte" 
                      value={newPage.description}
                      onChange={(e) => setNewPage({...newPage, description: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleAddPage}
                  >
                    <Plus size={16} className="mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SamplePagesPage;
