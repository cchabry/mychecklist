
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const ProjectsPage = () => {
  // Dans une future implémentation, nous récupérerons les projets depuis une API
  const mockProjects = [
    { id: '1', name: 'Site corporate', url: 'https://example.com', progress: 65 },
    { id: '2', name: 'Application mobile', url: 'https://mobile-app.com', progress: 23 },
  ];

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos projets d'audit d'accessibilité web
          </p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to="/project/new">
            <PlusCircle size={16} />
            Nouveau projet
          </Link>
        </Button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.url}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-sm text-right mt-1">{project.progress}%</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link to={`/project/${project.id}`}>
                    Détails
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to={`/project/${project.id}/audit/new`}>
                    Nouvel audit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
