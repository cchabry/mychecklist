
import React from 'react';
import { Project } from '@/lib/types';
import ProjectCard from './ProjectCard';
import { Loader2 } from 'lucide-react';

interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-tmw-teal mb-4" />
        <p className="text-muted-foreground">Chargement des projets...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <h3 className="text-red-800 font-medium mb-2">Erreur de chargement</h3>
        <p className="text-red-700 text-sm">{error.message}</p>
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
        <h3 className="text-gray-800 font-medium mb-2">Aucun projet trouvé</h3>
        <p className="text-gray-600 text-sm">
          Créez votre premier projet ou vérifiez votre configuration Notion.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectsList;
