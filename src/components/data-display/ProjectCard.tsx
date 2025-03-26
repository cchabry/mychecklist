
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/domain';
import { formatDate } from '@/utils/date';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
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
      <CardContent className="flex-grow">
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        )}
        <div className="space-y-2">
          {project.progress !== undefined && (
            <div className="flex justify-between text-sm">
              <span>Progression:</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
          )}
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
