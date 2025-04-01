
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, RefreshCw, Grid2X2, ListFilter } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { projects, isLoading, error } = useProjects();

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
            label: 'Rechercher',
            variant: 'outline',
            icon: (
              <div className="flex items-center relative w-56">
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
            label: 'Vue',
            variant: 'outline',
            icon: (
              <div className="flex items-center space-x-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setViewMode('list')}
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
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
      
      {isLoading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${viewMode === 'grid' ? 'h-64' : 'h-24'} bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse p-6`}>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
              {viewMode === 'grid' && (
                <div className="space-y-3">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              )}
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
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
