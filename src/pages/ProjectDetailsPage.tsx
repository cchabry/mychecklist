
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, List, CheckSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Simuler des données pour le développement
  const project = {
    id: projectId,
    name: 'Site Corporate Entreprise',
    url: 'https://example-corporate.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 65,
    samplePagesCount: 5,
    exigencesCount: 42,
    auditsCount: 2,
    lastAuditDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{project.name}</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-grow">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">URL du site</h3>
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {project.url}
                  </a>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Créé le</h3>
                  <p>{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Dernière modification</h3>
                  <p>{formatDate(project.updatedAt)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Progression</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{project.progress}% complété</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link to={`/project/${projectId}/edit`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier le projet
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-80">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <List className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Pages d'échantillon</h3>
                    <p className="text-2xl font-bold mt-1">{project.samplePagesCount}</p>
                    <Button variant="ghost" size="sm" className="mt-2 px-0" asChild>
                      <Link to={`/project/${projectId}/pages`}>
                        Gérer les pages
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <CheckSquare className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Exigences définies</h3>
                    <p className="text-2xl font-bold mt-1">{project.exigencesCount}</p>
                    <Button variant="ghost" size="sm" className="mt-2 px-0" asChild>
                      <Link to={`/project/${projectId}/exigences`}>
                        Configurer les exigences
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Audits réalisés</h3>
                    <p className="text-2xl font-bold mt-1">{project.auditsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dernier audit: {formatDate(project.lastAuditDate)}
                    </p>
                    <Button variant="primary" size="sm" className="mt-3 w-full" asChild>
                      <Link to={`/project/${projectId}/audit/new`}>
                        Nouvel audit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
