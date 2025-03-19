
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '@/components/ProjectCard';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import NotionDiagnosticTool from '@/components/notion/NotionDiagnosticTool';
import NotionGuide from '@/components/NotionGuide';
import { NotionConfig } from '@/components/notion';

const IndexPage = () => {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [currentTab, setCurrentTab] = useState('projects');
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  
  // Vérifier si Notion est configuré
  const notionConfigured = isNotionConfigured();
  const mockModeActive = notionApi.mockMode.isActive();
  
  const handleNotionConfigOpen = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
    window.location.reload(); // Reload to reflect new configuration
  };
  
  const handleNotionConfigSuccess = () => {
    // Reload to reflect new configuration
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
            <Link to="/new-project">
              <Button className="flex items-center gap-2">
                <PlusCircle size={18} />
                Nouveau projet
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="projects" className="w-full" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="pt-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <NotionGuide onConnectClick={handleNotionConfigOpen} />
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostic" className="pt-4">
            <NotionDiagnosticTool onConfigClick={handleNotionConfigOpen} />
          </TabsContent>
        </Tabs>
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
