
import { Calendar, FilePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useProjectAudits } from '@/hooks/useProjectAudits';
import { Project, Audit } from '@/types/domain';
import { AuditCard } from './AuditCard';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

/**
 * Carte d'affichage d'un projet avec ses audits
 */
export const ProjectCard = ({ project, className }: ProjectCardProps) => {
  const { id, name, createdAt } = project;
  
  const { audits, isLoading, error } = useProjectAudits(id);
  
  // Formatage de la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className={cn("hover:shadow-md transition-shadow bg-tertiary/30", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">
            <Link to={`/projects/${id}`} className="hover:text-primary transition-colors">
              {name}
            </Link>
          </h3>
        </div>
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
            {audits.map((audit: Audit) => (
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
};

export default ProjectCard;
