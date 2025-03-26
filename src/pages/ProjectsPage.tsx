
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/data-display/ProjectCard';
import { useProjects } from '@/hooks/useProjects';

const ProjectsPage = () => {
  const { projects, isLoading, error, isDemoMode } = useProjects();
  
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos projets d'audit et leurs exigences
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new" className="flex items-center gap-2">
            <PlusCircle size={16} />
            Nouveau projet
          </Link>
        </Button>
      </header>
      
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
          <h2 className="text-sm font-medium">Mode démonstration actif</h2>
          <p className="text-xs mt-1">
            Les données affichées sont fictives et ne sont pas persistantes.
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <h2 className="text-sm font-medium">Erreur de chargement</h2>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Placeholders de chargement
          Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="h-[250px] bg-gray-100 rounded-lg animate-pulse"
            />
          ))
        ) : projects.length > 0 ? (
          // Liste des projets
          projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          // Message si aucun projet
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground mb-4">Aucun projet trouvé</p>
            <Button asChild>
              <Link to="/projects/new" className="flex items-center gap-2">
                <PlusCircle size={16} />
                Créer un projet
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
