
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { ProjectCard } from '@/components/data-display/ProjectCard';
import { Project } from '@/types/domain';

/**
 * Page d'accueil affichant les projets et permettant d'en créer de nouveaux
 */
const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Site Corporate',
      url: 'www.example.com',
      createdAt: '2023-01-01',
      updatedAt: '2023-05-15',
      status: 'active',
      lastAuditDate: '2023-04-20'
    },
    {
      id: '2',
      name: 'Application Mobile',
      url: 'app.example.org',
      createdAt: '2023-02-10',
      updatedAt: '2023-04-05',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Plateforme E-commerce',
      url: 'shop.example.net',
      createdAt: '2022-11-15',
      updatedAt: '2023-03-20',
      status: 'completed',
      lastAuditDate: '2023-03-10'
    }
  ]);
  
  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-tertiary/20 p-6">
      <PageHeader 
        title="Tableau de bord" 
        description="Gérez vos projets d'audit"
        actions={[
          {
            label: 'Nouveau projet',
            icon: <Plus className="mr-2 h-4 w-4" />,
            href: '/projects/new'
          },
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
