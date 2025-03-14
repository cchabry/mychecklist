
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formattedDate = formatDistanceToNow(new Date(project.updatedAt), { 
    addSuffix: true,
    locale: fr
  });
  
  return (
    <Link 
      to={`/audit/${project.id}`} 
      className="group transition-transform duration-300 hover:-translate-y-1"
    >
      <Card className="overflow-hidden h-full transition-all duration-300 border border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium rounded-full px-2.5 py-1 bg-secondary">
              {project.itemsCount} critères
            </div>
            
            <div className={`text-xs font-medium rounded-full px-2.5 py-1 flex items-center ${
              project.progress === 0 ? 'bg-secondary text-muted-foreground' : 
              project.progress < 50 ? 'bg-warning/10 text-warning' : 
              project.progress < 100 ? 'bg-warning/20 text-warning' : 
              'bg-success/10 text-success'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${
                project.progress === 0 ? 'bg-muted-foreground' : 
                project.progress < 50 ? 'bg-warning' : 
                project.progress < 100 ? 'bg-warning' : 
                'bg-success'
              }`}></span>
              {project.progress === 0 
                ? 'Non commencé' 
                : project.progress === 100 
                  ? 'Complété' 
                  : `${project.progress}% complété`}
            </div>
          </div>
          
          <h3 className="text-xl font-medium mb-1 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          
          <p className="text-sm text-muted-foreground truncate">
            {project.url}
          </p>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t border-border/40 bg-secondary/30">
          <p className="text-xs text-muted-foreground">
            Mis à jour {formattedDate}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
