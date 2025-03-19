
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Settings, RotateCw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/ProjectCard';
import { NotionConfig } from '@/components/notion';
import MockModeToggle from '@/components/MockModeToggle';
import { getProjectsFromNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleRefresh = () => {
    setProjects([]);
    setIsLoading(true);
    
    // Forcer l'effacement du cache des projets
    localStorage.removeItem('projects_cache');
    
    loadProjects();
    
    toast.info("Actualisation en cours", {
      description: "Chargement des données les plus récentes"
    });
  };

  const handleForceReset = () => {
    notionApi.mockMode.forceReset();
    
    // Recharger après réinitialisation
    setTimeout(() => {
      handleRefresh();
    }, 600);
  };
  
  const handleMockToggle = (isMockMode: boolean) => {
    // La fonction de rafraîchissement est déjà dans le component MockModeToggle
    console.log(`Mode mock ${isMockMode ? 'activé' : 'désactivé'}`);
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

  const onClose = () => {
    setIsOpen(false);
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
          <MockModeToggle onToggle={handleMockToggle} />
          
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

      {/* Indicateur de mode mock */}
      {notionApi.mockMode.isActive() && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="font-medium">Mode démonstration actif</span>
          </div>
          <p className="mt-1 text-xs">
            Les données affichées sont fictives. Pour utiliser les données réelles de Notion, désactivez le mode démonstration.
          </p>
        </div>
      )}

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

      <NotionConfig
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleNotionSuccess}
      />
    </div>
  );
};

// N'oubliez pas d'importer AlertTriangle
import { AlertTriangle } from 'lucide-react';

export default ProjectPage;
