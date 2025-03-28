import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { ProjectCard } from '@/components/data-display/ProjectCard';
import { Project } from '@/types/domain';
import { ProjectStatus } from '@/types/enums';
import { useProjects, useNavigate } from '@/hooks';

/**
 * Page d'accueil de l'application
 * 
 * Cette page affiche le tableau de bord principal avec les projets et leurs statuts.
 */
const Dashboard = () => {
  const { data: projects, isLoading, error } = useProjects();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  
  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    (project.url?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // Fonction de regroupement des projets par statut
  const getProjectsByStatus = (statusToFilter: string) => {
    if (!projects) return [];
    return projects.filter(project => project.status === statusToFilter);
  };
  
  // Groupes de projets par statut
  const activeProjects = projects ? getProjectsByStatus(ProjectStatus.ACTIVE) : [];
  const pendingProjects = projects ? getProjectsByStatus(ProjectStatus.PENDING) : [];
  const completedProjects = projects ? getProjectsByStatus(ProjectStatus.COMPLETED) : [];
  
  return (
    <div className="p-6">
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
      
      {filteredProjects.length === 0 ? (
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
