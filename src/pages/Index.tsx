import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Settings, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { NotionConfigModal } from '@/components/notion';
import { getProjectsFromNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleRefresh = () => {
    // Rafraîchir la liste des projets
    setProjects([]);
    setIsLoading(true);
    loadProjects();
  };

  const handleForceReset = () => {
    // Réinitialiser complètement l'état et le mode mock
    notionApi.mockMode.forceReset();
    // Le rechargement de la page est fait dans la fonction forceReset
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsFromNotion();
      setProjects(data.projects);
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
      toast.error("Erreur de chargement des projets", {
        description: "Impossible de charger les projets depuis Notion."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleNotionSuccess = () => {
    toast.success("Configuration Notion enregistrée", {
      description: "L'application est maintenant connectée à votre base de données Notion."
    });
    loadProjects();
  };

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-tmw-darkgray">
          Mes projets
        </h1>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
          >
            <RotateCw size={16} />
            Actualiser
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsOpen(true)}
          >
            <Settings size={16} />
            Configuration
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-red-500"
            onClick={handleForceReset}
            title="Forcer l'état réel et réinitialiser tous les caches"
          >
            <RefreshCw size={16} />
            Réinitialiser
          </Button>
          
          <Link to="/new-project">
            <Button className="gap-2 bg-tmw-teal hover:bg-tmw-teal/90">
              <Plus size={16} />
              Nouveau projet
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-transparent border-tmw-teal rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <NotionConfigModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSuccess={handleNotionSuccess}
      />
    </div>
  );
};

export default ProjectPage;
