
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/data-display/ProjectCard';
import { getProjects } from '@/features/projects';
import { Project } from '@/types/domain';
import { Plus, FolderOpen } from 'lucide-react';

/**
 * Page d'accueil / Dashboard
 * Affiche la liste des projets sous forme de cartes
 */
const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
        setError('Impossible de charger les projets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // On affiche seulement les 5 premiers projets
  const displayedProjects = projects.slice(0, 5);
  const hasMoreProjects = projects.length > 5;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Tableau de bord" 
          description="Vue d'ensemble de vos projets"
        />
        <Button asChild>
          <Link to="/projects/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-56 animate-pulse bg-gray-100"></Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 mb-4">Aucun projet trouvé</h2>
          <p className="text-gray-500 mb-6">Commencez par créer votre premier projet</p>
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          
          {hasMoreProjects && (
            <Card className="h-full flex flex-col justify-center items-center p-6 bg-gray-50 border-dashed">
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-medium text-gray-700">Plus de projets</h3>
                <p className="text-sm text-gray-500">Accédez à tous vos projets ou créez-en un nouveau</p>
                <div className="flex flex-col gap-3 mt-4">
                  <Button asChild variant="default">
                    <Link to="/projects" className="flex items-center gap-2 w-full justify-center">
                      <FolderOpen className="h-4 w-4" />
                      Tous les projets
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/projects/new" className="flex items-center gap-2 w-full justify-center">
                      <Plus className="h-4 w-4" />
                      Nouveau projet
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
