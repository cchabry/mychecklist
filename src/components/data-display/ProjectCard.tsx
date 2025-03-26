
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, FilePlus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types/domain';
import { formatDate } from '@/utils/date';
import { useProjectAudits } from '@/hooks/useProjectAudits';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { audits, isLoading: isLoadingAudits, error: auditsError } = useProjectAudits(project.id);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{project.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <ExternalLink size={14} />
          <a 
            href={project.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline truncate"
          >
            {project.url}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
        )}

        {/* Section d'affichage des audits */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Audits</h3>
          
          {isLoadingAudits ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : auditsError ? (
            <div className="bg-red-50 p-3 rounded-md border border-red-200 text-sm text-red-600">
              Erreur lors du chargement des audits
            </div>
          ) : audits.length > 0 ? (
            <div className="space-y-3">
              {audits.map((audit) => (
                <div key={audit.id} className="bg-gray-50 p-3 rounded-md border text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{audit.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(audit.updatedAt)}
                    </span>
                  </div>
                  
                  {audit.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progression</span>
                        <span>{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link to={`/projects/${project.id}/audits/${audit.id}`}>
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Voir l'audit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md border text-center text-sm text-muted-foreground">
              Aucun audit pour ce projet
            </div>
          )}
          
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to={`/projects/${project.id}/audits/new`} className="flex items-center justify-center">
              <FilePlus className="h-4 w-4 mr-2" />
              Nouvel audit
            </Link>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <span className="text-xs text-muted-foreground">
          Mis à jour le {formatDate(project.updatedAt)}
        </span>
        <Button asChild size="sm">
          <Link to={`/projects/${project.id}`} className="flex items-center gap-1">
            Détails <ArrowRight size={14} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
