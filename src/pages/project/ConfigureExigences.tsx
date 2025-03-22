
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ExigencesList from '@/components/exigences/ExigencesList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const ConfigureExigences: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  if (!projectId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <h2 className="text-lg font-semibold">Erreur</h2>
            <p>Aucun projet spécifié</p>
            <Button 
              className="mt-2" 
              variant="outline" 
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/project/${projectId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au projet
            </Button>
            <h1 className="text-3xl font-bold">Configuration des exigences</h1>
          </div>
          
          <Button onClick={() => {
            toast.success('Configuration sauvegardée', {
              description: 'Les exigences ont été mises à jour'
            });
            navigate(`/project/${projectId}`);
          }}>
            <Save className="mr-2 h-4 w-4" />
            Terminer la configuration
          </Button>
        </div>

        <ExigencesList projectId={projectId} />
      </main>
    </div>
  );
};

export default ConfigureExigences;
