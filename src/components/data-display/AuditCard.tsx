
import { Link } from 'react-router-dom';
import { Play, FileText, Clock, CheckCircle, Circle } from 'lucide-react';
import { Progress } from '@/components/ui';
import { Button } from '@/components/ui';
import { Audit, ActionStatus } from '@/types/domain';
import { formatDate } from '@/lib/utils';

interface AuditCardProps {
  audit: Audit;
  projectId: string;
}

/**
 * Carte affichant un audit avec ses métriques
 */
export const AuditCard = ({ audit, projectId }: AuditCardProps) => {
  const { id, name, updatedAt, progress = 0, actionsCount } = audit;
  
  return (
    <div className="bg-white p-3 rounded-md border border-gray-100 relative shadow-sm hover:shadow-md transition-shadow">
      <Link 
        to={`/projects/${projectId}/audits/${id}`}
        className="absolute top-3 right-3 text-primary hover:text-primary/80 transition-colors" 
      >
        <Play size={16} />
      </Link>
      
      <div className="mb-2">
        <h4 className="font-medium text-gray-800">{name}</h4>
        <p className="text-xs text-gray-500">
          Dernière mise à jour: {formatDate(updatedAt)}
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs">Progression</span>
            <span className="text-xs">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {actionsCount && (
          <div className="flex justify-start">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 gap-1 text-xs flex items-center" 
              asChild
            >
              <Link to={`/projects/${projectId}/audits/${id}/actions`}>
                <FileText size={12} />
                Plan d'action
                <Circle size={12} className="ml-1 text-red-500" />
                <span className="text-red-500">{actionsCount[ActionStatus.ToDo] || 0}</span>
                <span className="mx-0.5 text-muted-foreground">|</span>
                <Clock size={12} className="text-blue-500" />
                <span className="text-blue-500">{actionsCount[ActionStatus.InProgress] || 0}</span>
                <span className="mx-0.5 text-muted-foreground">|</span>
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-green-500">{actionsCount[ActionStatus.Done] || 0}</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
