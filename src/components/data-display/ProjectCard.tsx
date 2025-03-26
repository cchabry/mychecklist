
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '@/types/domain';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="bg-white/90 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>{project.name}</span>
          <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">{project.progress}%</span>
        </CardTitle>
        {project.url && (
          <CardDescription className="flex items-center gap-1 truncate">
            <ExternalLink size={14} />
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
              {project.url}
            </a>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Créé le</span>
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Mis à jour</span>
            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-0">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link to={`/projects/${project.id}`}>
            <Edit size={14} className="mr-1" />
            Détails
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Trash size={14} className="mr-1" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
};
