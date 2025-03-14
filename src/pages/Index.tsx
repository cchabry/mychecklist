
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { Plus, CheckSquare } from 'lucide-react';

const Index = () => {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-tmw-teal/5">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-tmw-teal rounded-full p-3">
              <CheckSquare size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-tmw-teal">Audits Qualité Web</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Évaluez la qualité et la conformité de vos projets web en utilisant notre référentiel de bonnes pratiques.
          </p>
        </motion.section>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-tmw-darkgray">Projets</h2>
            <Button asChild className="bg-tmw-teal hover:bg-tmw-teal/90 transition-all duration-300">
              <Link to="/new-project">
                <Plus size={16} className="mr-2" />
                Nouveau projet
              </Link>
            </Button>
          </div>
          
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-tmw-teal/20 shadow-sm">
              <div className="w-16 h-16 bg-tmw-coral/20 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-tmw-coral" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-tmw-darkgray">Aucun projet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Vous n'avez pas encore créé de projet à auditer. Commencez par créer votre premier projet.
              </p>
              <Button asChild className="bg-tmw-teal hover:bg-tmw-teal/90 transition-all duration-300">
                <Link to="/new-project">
                  <Plus size={16} className="mr-2" />
                  Créer un projet
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      
      <footer className="py-6 border-t border-tmw-teal/10 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} myChecklist - Audits Qualité Web
          <div className="mt-2 text-xs text-muted-foreground/70">by ThinkMyWeb</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
