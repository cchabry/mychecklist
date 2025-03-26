
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout';
import { ProjectCard } from '@/components/data-display/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Page d'accueil affichant les projets et permettant d'en créer de nouveaux
 */
const Dashboard = () => {
  const [search, setSearch] = useState('');
  const { projects, isLoading, error, isDemoMode } = useProjects();
  
  // Filtrer les projets selon la recherche
  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.url && project.url.toLowerCase().includes(search.toLowerCase()))
    );
  }, [projects, search]);

  return (
    <div className="p-6">
      <PageHeader 
        title="Tableau de bord" 
        description={isDemoMode ? "Mode démonstration - Données fictives" : "Gérez vos projets d'audit"}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un projet..."
                className="pl-8 bg-white/80"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link to="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau projet
              </Link>
            </Button>
          </div>
        }
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border rounded-md bg-white/90">
          <h3 className="text-lg font-medium text-red-600">Erreur lors du chargement des projets</h3>
          <p className="text-muted-foreground mt-1">
            Veuillez réessayer ultérieurement
          </p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Rafraîchir la page
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-white/90">
          <h3 className="text-lg font-medium">Aucun projet trouvé</h3>
          <p className="text-muted-foreground mt-1">
            {search ? 'Modifiez votre recherche ou ' : ''}créez un nouveau projet pour commencer
          </p>
          <Button asChild className="mt-4">
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau projet
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
