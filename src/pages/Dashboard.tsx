
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await notionApi.getProjects();
        setProjects(projectsData);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors du chargement des projets:', err);
        setError(err.message || 'Erreur lors du chargement des projets');
        toast.error('Erreur lors du chargement des projets');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/notion-config">
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </Link>
            </Button>
            <Button asChild>
              <Link to="/project/new">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau projet
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-48"></CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-600 mb-4">Aucun projet trouvé</h2>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier projet</p>
            <Button asChild>
              <Link to="/project/new">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau projet
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
