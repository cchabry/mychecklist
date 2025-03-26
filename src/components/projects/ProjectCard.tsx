
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, extractDomain, truncateText } from '@/lib/utils';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{project.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <span className="truncate">{extractDomain(project.url)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <Calendar size={14} />
          <span>Créé le {formatDate(project.createdAt)}</span>
        </div>
        <div className="mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full" 
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Progression: {project.progress || 0}%
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/project/${project.id}`}>
            Détails
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to={`/project/${project.id}/audit`}>
            Audit <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
