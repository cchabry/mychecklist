import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, Database, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '@/components/ProjectCard';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { isNotionConfigured } from '@/lib/notion';
import NotionGuide from '@/components/NotionGuide';
import { NotionConfig } from '@/components/notion';
import { getProjectsFromNotion } from '@/lib/notion';
import { Project } from '@/lib/types';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';

const IndexPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  
  const { isDemoMode, enableDemoMode } = useOperationMode();
  const notionConfigured = isNotionConfigured();
  
  // Fetch projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Forcer une petite pause pour assurer que les messages de toast
        // antérieurs aient le temps d'être affichés
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { projects } = await getProjectsFromNotion();
        setProjects(projects);
        setError(null);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Erreur lors du chargement des projets');
        
        // Activer le mode démo en cas d'erreur non gérée
        if (!isDemoMode) {
          enableDemoMode('Erreur lors du chargement des projets');
          toast.info('Mode démonstration activé automatiquement', { 
            description: 'Suite à une erreur, l\'application utilise des données fictives'
          });
          
          // Recharger les données en mode démo après un court délai
          setTimeout(async () => {
            try {
              const { projects } = await getProjectsFromNotion();
              setProjects(projects);
            } catch (mockError) {
              console.error('Failed to load mock projects:', mockError);
            } finally {
              setIsLoading(false);
            }
          }, 500);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, [isDemoMode, enableDemoMode]);
  
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
            <Link to="/new-project">
              <Button className="flex items-center gap-2">
                <PlusCircle size={18} />
                Nouveau projet
              </Button>
            </Link>
          </div>
        </div>
        
        {isDemoMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <h2 className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <TestTube size={16} className="text-amber-600" />
              Mode démonstration actif
            </h2>
            <p className="text-xs text-amber-700 mt-1">
              L'application utilise des données fictives. {notionConfigured ? 
              'Votre configuration Notion est présente mais le mode démonstration est activé.' : 
              'Aucune configuration Notion n\'a été trouvée.'}
            </p>
            {notionConfigured && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
                onClick={() => {
                  enableDemoMode();
                  window.location.reload();
                }}
              >
                Désactiver le mode démonstration
              </Button>
            )}
          </div>
        )}
        
        {error && !isDemoMode && (
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
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 bg-gray-100 rounded-xl animate-pulse"></div>
            ))
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
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
        
        {!isLoading && projects.length === 0 && !error && !isDemoMode && (
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
