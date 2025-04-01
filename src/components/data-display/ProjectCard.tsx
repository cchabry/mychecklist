
import { Calendar, FilePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useProjectAudits } from '@/hooks/useProjectAudits';
import { Project } from '@/types/domain';
import { AuditCard } from './AuditCard';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  className?: string;
  viewMode?: 'grid' | 'list';
}

/**
 * Carte d'affichage d'un projet avec ses audits
 */
export const ProjectCard = ({ project, className, viewMode = 'grid' }: ProjectCardProps) => {
  const { id, name, createdAt, description } = project;
  
  const { audits, isLoading, error } = useProjectAudits(id);
  
  // Version grille (par défaut)
  if (viewMode === 'grid') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow bg-white/90", className)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold">
              <Link to={`/projects/${id}`} className="hover:text-primary transition-colors">
                {name}
              </Link>
            </h3>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded border border-red-200">
              Impossible de charger les audits
            </div>
          ) : audits.length > 0 ? (
            <div className="space-y-3 mt-3">
              {audits.map(audit => (
                <AuditCard key={audit.id} audit={audit} projectId={id} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground bg-white/60 rounded border border-gray-100">
              Aucun audit pour ce projet
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            asChild
          >
            <Link to={`/projects/${id}/audits/new`}>
              <FilePlus size={16} className="mr-2" />
              Nouvel audit
            </Link>
          </Button>
        </CardContent>
        
        <CardFooter className="pt-2 text-xs text-muted-foreground border-t">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Créé le {formatDate(createdAt)}
          </span>
        </CardFooter>
      </Card>
    );
  }
  
  // Version liste
  return (
    <Card className={cn("hover:shadow-md transition-shadow bg-white/90", className)}>
      <div className="flex items-center p-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold">
            <Link to={`/projects/${id}`} className="hover:text-primary transition-colors">
              {name}
            </Link>
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-muted-foreground flex items-center">
              <Calendar size={10} className="mr-1" />
              {formatDate(createdAt)}
            </span>
            {!isLoading && !error && (
              <span className="text-xs">
                {audits.length} audit{audits.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            asChild
          >
            <Link to={`/projects/${id}`}>
              Détails
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8"
            asChild
          >
            <Link to={`/projects/${id}/audits/new`}>
              <FilePlus size={14} className="mr-1" />
              Audit
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
