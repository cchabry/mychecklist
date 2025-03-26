
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/data-display/ProjectCard';

const ProjectsPage = () => {
  const { projects, isLoading, error, isDemoMode } = useProjects();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des projets...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Projets</h1>
      
      {isDemoMode && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
          Mode démo activé. Les données affichées sont fictives.
        </div>
      )}
      
      {projects.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun projet trouvé. Créez votre premier projet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
