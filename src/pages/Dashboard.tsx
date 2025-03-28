
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/data-display';
import { PageHeader } from '@/components/layout';
import { Project } from '@/types/domain';
import { ProjectStatus } from '@/types/enums';

/**
 * Page de tableau de bord
 */
export function Dashboard() {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <div>Erreur: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de vos projets"
        actions={[
          {
            label: 'Nouveau projet',
            href: '/projects/new',
            variant: 'default'
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {projects.map((project: Project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
