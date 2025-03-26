
import { ClipboardList, Calendar, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  status?: 'active' | 'completed' | 'pending' | 'archived';
  lastAuditDate?: string;
}

interface ProjectCardProps {
  project: Project;
  className?: string;
}

/**
 * Carte d'affichage d'un projet avec ses informations principales
 */
export const ProjectCard = ({ project, className }: ProjectCardProps) => {
  const { id, name, url, status, progress, lastAuditDate } = project;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'archived':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };
  
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium">
            <Link to={`/projects/${id}`} className="hover:text-primary transition-colors">
              {name}
            </Link>
          </h3>
          {status && (
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <ExternalLink size={14} />
          <a 
            href={url.startsWith('http') ? url : `https://${url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline truncate max-w-xs"
          >
            {url}
          </a>
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="h-2 bg-gray-200 rounded-full mb-4">
          <div 
            className="h-2 bg-primary rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <ClipboardList size={14} />
            <span>Exigences: 12</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users size={14} />
            <span>Pages: 5</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 text-xs text-muted-foreground border-t mt-2 pt-2">
        <div className="flex justify-between w-full">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {lastAuditDate ? `Dernier audit: ${lastAuditDate}` : 'Aucun audit'}
          </span>
          <Link 
            to={`/projects/${id}`}
            className="text-primary hover:underline"
          >
            Voir détails
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
