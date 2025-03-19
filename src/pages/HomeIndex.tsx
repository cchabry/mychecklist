
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Database, AlertTriangle, ShieldAlert, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import ProjectsList from '@/components/ProjectsList';
import { useNotionProjects } from '@/hooks/useNotionProjects';
import { useNotion } from '@/contexts/NotionContext';
import NotionGuide from '@/components/NotionGuide';
import { NotionConfig } from '@/components/notion';
import { notionApi } from '@/lib/notionProxy';

const HomePage: React.FC = () => {
  const { projects, isLoading, error } = useNotionProjects();
  const { openConfig, closeConfig, status, showConfig } = useNotion();
  
  // Vérifier si l'erreur est liée à un problème d'autorisation
  const isAuthError = error?.message?.includes('autorisation') || 
                     error?.message?.includes('accès') ||
                     error?.message?.includes('403');
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-tmw-teal/5">
      <Header />
      
      <main className="container px-4 py-6 md:py-10 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-gray-500">Gérez vos audits et projets</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-tmw-teal border-tmw-teal/20 hover:bg-tmw-teal/5"
              onClick={openConfig}
            >
              <Database size={18} />
              Configurer Notion
            </Button>
            <Link to="/new-project">
              <Button className="flex items-center gap-2">
                <PlusCircle size={18} />
                Nouveau projet
              </Button>
            </Link>
          </div>
        </div>
        
        {status.isMockMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <h2 className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-500" />
              Mode démonstration actif
            </h2>
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
        
        {isAuthError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <h2 className="text-sm font-medium text-red-800 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-500" />
              Problème d'accès à votre base de données Notion
            </h2>
            <p className="text-xs text-red-700 mt-1">
              Votre intégration n'a pas accès à la base de données configurée. Pour résoudre ce problème :
            </p>
            <ol className="text-xs text-red-700 mt-2 list-decimal list-inside space-y-1">
              <li>Ouvrez votre base de données dans Notion</li>
              <li>Cliquez sur les trois points (...) en haut à droite</li>
              <li>Sélectionnez <strong>Connexions</strong></li>
              <li>Ajoutez votre intégration à la liste des connexions</li>
            </ol>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 bg-red-100 hover:bg-red-200 text-red-800"
                onClick={openConfig}
              >
                Vérifier la configuration
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 bg-red-100 hover:bg-red-200 text-red-800"
                onClick={() => {
                  window.open('https://www.notion.so/my-integrations', '_blank');
                }}
              >
                <ExternalLink size={14} className="mr-1" />
                Mes intégrations Notion
              </Button>
            </div>
          </div>
        )}
        
        <ProjectsList projects={projects} isLoading={isLoading} error={error} />
        
        {!isLoading && !error && projects.length === 0 && (
          <div className="mt-6 flex justify-center">
            <NotionGuide onConnectClick={openConfig} />
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t border-tmw-teal/10 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} myChecklist - Audits Qualité Web
          <div className="mt-2 text-xs text-muted-foreground/70">by ThinkMyWeb</div>
        </div>
      </footer>
      
      <NotionConfig
        isOpen={showConfig}
        onClose={closeConfig}
      />
    </div>
  );
};

export default HomePage;
