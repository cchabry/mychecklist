
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Plus, Info } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/ProjectCard';
import { getAllProjects } from '@/lib/mockData';
import { isNotionConfigured } from '@/lib/notion';
import { NotionConfig, NotionProxyConfigGuide } from '@/components/notion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Index = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [usingNotion, setUsingNotion] = useState(false);
  const [environment, setEnvironment] = useState({
    type: 'Unknown',
    host: window.location.hostname,
    isVercel: false,
    isLocalhost: false,
    isLovable: false
  });

  useEffect(() => {
    // Déterminer l'environnement
    const hostname = window.location.hostname;
    const isVercel = hostname.includes('vercel.app');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLovable = hostname.includes('lovable');
    
    setEnvironment({
      type: isVercel ? 'Vercel' : isLovable ? 'Lovable Preview' : isLocalhost ? 'Développement local' : 'Autre',
      host: hostname,
      isVercel,
      isLocalhost,
      isLovable
    });

    // Vérifie si Notion est configuré
    const notionConfigured = isNotionConfigured();
    setUsingNotion(notionConfigured);

    // Charge les projets (simulé avec un délai pour l'UX)
    setTimeout(() => {
      setProjects(getAllProjects());
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
            <p className="text-gray-600">Gérez vos audits d'accessibilité et suivez votre progression</p>
            <div className="mt-2 flex items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                environment.isVercel ? 'bg-blue-100 text-blue-800' : 
                environment.isLovable ? 'bg-purple-100 text-purple-800' : 
                environment.isLocalhost ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {environment.type}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={16} className="ml-2 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hôte: {environment.host}</p>
                    <p>Version: {import.meta.env.MODE}</p>
                    <p>Date de construction: {new Date().toLocaleDateString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <NotionProxyConfigGuide />
            
            <Button
              variant="outline"
              className="flex items-center gap-2 text-tmw-teal border-tmw-teal/20 hover:bg-tmw-teal/5"
              onClick={() => setConfigOpen(true)}
            >
              <Database size={16} />
              {usingNotion ? 'Reconfigurer Notion' : 'Connecter à Notion'}
            </Button>
            
            <Button asChild className="bg-tmw-teal hover:bg-tmw-teal/90">
              <Link to="/new-project" className="flex items-center gap-2">
                <Plus size={16} />
                Nouveau projet
              </Link>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-t-tmw-teal border-tmw-teal/30 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Link 
                to="/new-project"
                className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-tmw-teal hover:bg-tmw-teal/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-tmw-teal/10 flex items-center justify-center mb-4">
                  <Plus size={24} className="text-tmw-teal" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nouveau projet</h3>
                <p className="text-sm text-gray-500 text-center">Commencez un nouvel audit d'accessibilité</p>
                <Button 
                  variant="link" 
                  className="mt-4 text-tmw-teal flex items-center gap-1"
                >
                  Créer un projet
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </main>
      
      <NotionConfig
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        onSuccess={() => {
          setUsingNotion(true);
        }}
      />
    </div>
  );
};

export default Index;
