
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/projects/ProjectCard';
import { Project } from '@/lib/types';

// Données simulées pour le développement - à remplacer par des données réelles
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Site Corporate Entreprise',
    url: 'https://example-corporate.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 65
  },
  {
    id: '2',
    name: 'Boutique en ligne',
    url: 'https://example-shop.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semaine avant
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours avant
    progress: 30
  },
  {
    id: '3',
    name: 'Application mobile',
    url: 'https://example-app.com',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 semaines avant
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 10
  }
];

const HomePage = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projets</h1>
          <p className="text-muted-foreground">Gérez vos audits et projets d'évaluation</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to="/project/new" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau projet
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-3">Aucun projet</h3>
          <p className="text-muted-foreground mb-6">Vous n'avez pas encore créé de projet d'audit.</p>
          <Button asChild>
            <Link to="/project/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer un projet
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
