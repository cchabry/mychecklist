import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Play, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Project } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-md rounded-lg border border-tmw-blue/10 shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
        <CardDescription>
          Mis à jour {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={project.progress} />
        <p className="text-sm text-muted-foreground mt-2">
          {project.progress}% complété ({project.itemsCount} critères)
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Link to={`/project/${project.id}/pages`}>
              <FileText size={14} />
              Pages d'échantillon
            </Link>
          </Button>
          
          <Button
            asChild
            size="sm"
            className="gap-1.5 bg-tmw-teal text-white hover:bg-tmw-teal/90"
          >
            <Link to={`/audit/${project.id}`}>
              <Play size={14} />
              Démarrer l'audit
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
