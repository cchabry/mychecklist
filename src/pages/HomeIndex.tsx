
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, Database, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '@/components/ProjectCard';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import NotionGuide from '@/components/NotionGuide';
import { NotionConfig } from '@/components/notion';
import { getProjectsFromNotion } from '@/lib/notion';
import { Project } from '@/lib/types';
import { toast } from 'sonner';

const IndexPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  
  const notionConfigured = isNotionConfigured();
  const mockModeActive = notionApi.mockMode.isActive();
  
  // Fetch projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { projects } = await getProjectsFromNotion();
        setProjects(projects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Erreur lors du chargement des projets');
        toast.error('Erreur lors du chargement des projets');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  const handleNotionConfigOpen = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
    window.location.reload();
  };
  
  const handleNotionConfigSuccess = () => {
    window.location.reload();
  };
  
  return (
    <div className="mx-auto max-w-screen-xl">
      <Header />
      
      <main className="container px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-gray-500">Gérez vos audits et projets</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-tmw-teal border-tmw-teal/20 hover:bg-tmw-teal/5"
              onClick={handleNotionConfigOpen}
            >
              <Database size={18} />
              {notionConfigured ? 'Reconfigurer Notion' : 'Configurer Notion'}
            </Button>
            <Link to="/diagnostics">
              <Button
                variant="outline" 
                className="flex items-center gap-2"
              >
                <TestTube size={18} />
                Diagnostics Notion
              </Button>
            </Link>
            <Link to="/new-project">
              <Button className="flex items-center gap-2">
                <PlusCircle size={18} />
                Nouveau projet
              </Button>
            </Link>
          </div>
        </div>
        
        {notionConfigured && mockModeActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <h2 className="text-sm font-medium text-amber-800">Mode démonstration actif</h2>
            <p className="text-xs text-amber-700 mt-1">
              L'application utilise des données fictives. Votre configuration Notion est présente 
              mais le mode démonstration est activé.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
              onClick={() => {
                notionApi.mockMode.deactivate();
                window.location.reload();
              }}
            >
              Désactiver le mode démonstration
            </Button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <h2 className="text-sm font-medium text-red-800">Erreur de chargement</h2>
            <p className="text-xs text-red-700 mt-1">
              Les projets n'ont pas pu être chargés depuis Notion. Vérifiez votre configuration.
            </p>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 bg-red-100 hover:bg-red-200 text-red-800"
                onClick={handleNotionConfigOpen}
              >
                Vérifier la configuration
              </Button>
              <Link to="/diagnostics">
                <Button
                  variant="outline" 
                  size="sm" 
                  className="border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
                >
                  Lancer les diagnostics
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {isLoading ? (
            // Show loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 bg-gray-100 rounded-xl animate-pulse"></div>
            ))
          ) : projects.length > 0 ? (
            // Show projects
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            // Show empty state
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground mb-4">Aucun projet trouvé</p>
              <Link to="/new-project">
                <Button>
                  <PlusCircle size={16} className="mr-2" />
                  Créer un projet
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {!isLoading && projects.length === 0 && !error && (
          <div className="mt-6 flex justify-center">
            <NotionGuide onConnectClick={handleNotionConfigOpen} />
          </div>
        )}
      </main>
      
      <NotionConfig
        isOpen={notionConfigOpen}
        onClose={handleNotionConfigClose}
        onSuccess={handleNotionConfigSuccess}
      />
    </div>
  );
};

export default IndexPage;
