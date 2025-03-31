
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { ProjectCard } from '@/components/data-display/ProjectCard';
import { useProjects } from '@/hooks/useProjects';

/**
 * Page d'accueil affichant les projets et permettant d'en créer de nouveaux
 */
const Dashboard = () => {
  const [search, setSearch] = useState('');
  const { projects, isLoading, error, isDemoMode } = useProjects();

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    (project.url && project.url.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      <PageHeader 
        title="Tableau de bord" 
        description="Gérez vos projets d'audit"
        actions={[
          {
            label: '',
            variant: 'outline',
            icon: (
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
            )
          },
          {
            label: 'Nouveau projet',
            icon: <Plus className="mr-2 h-4 w-4" />,
            href: '/projects/new'
          }
        ]}
      />
      
      {isDemoMode && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          <p className="text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Mode démonstration actif - Les données affichées sont fictives
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border rounded-md bg-white/90">
          <h3 className="text-lg font-medium text-red-600">Erreur lors du chargement des projets</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Impossible de récupérer la liste des projets
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
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
