
import { Calendar, Play, FileText, CheckCircle, AlertCircle, CircleDashed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Audit } from '@/types/domain';
import { cn } from '@/lib/utils';

interface AuditCardProps {
  audit: Audit;
  projectId: string;
  className?: string;
}

/**
 * Carte d'affichage d'un audit avec ses informations et métriques
 */
export const AuditCard = ({ audit, projectId, className }: AuditCardProps) => {
  const { id, name, updatedAt, progress } = audit;
  
  // Simulation de données pour l'interface
  // Dans une version réelle, ces données viendraient d'un état ou d'un service
  const complianceStats = {
    compliant: 8,
    partiallyCompliant: 3,
    nonCompliant: 4,
    total: 15
  };
  
  const actionCount = 6;
  
  // Déterminer le statut de l'audit selon l'avancement
  const getAuditStatus = (progress: number) => {
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'pending';
  };
  
  const status = getAuditStatus(progress);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'À démarrer';
      default: return 'Inconnu';
    }
  };
  
  // Formatage de la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn("bg-white/60 hover:bg-white/80 transition-colors border-gray-200", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h4 className="text-base font-medium">{name}</h4>
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Calendar size={12} />
          Mis à jour le {formatDate(updatedAt)}
        </p>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs">Progression</span>
            <span className="text-xs">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs mt-1 text-muted-foreground">
            {Math.round(progress * complianceStats.total / 100)} / {complianceStats.total} exigences évaluées
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-1 bg-green-50 rounded">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs font-semibold">{complianceStats.compliant}</span>
            <span className="text-[10px] leading-tight text-center">Conforme</span>
          </div>
          <div className="flex flex-col items-center p-1 bg-yellow-50 rounded">
            <CircleDashed size={14} className="text-yellow-500" />
            <span className="text-xs font-semibold">{complianceStats.partiallyCompliant}</span>
            <span className="text-[10px] leading-tight text-center">Partiel</span>
          </div>
          <div className="flex flex-col items-center p-1 bg-red-50 rounded">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs font-semibold">{complianceStats.nonCompliant}</span>
            <span className="text-[10px] leading-tight text-center">Non conforme</span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs pt-1">
          <Link 
            to={`/projects/${projectId}/audits/${id}`}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Play size={12} />
            Continuer l'audit
          </Link>
          
          <Link
            to={`/projects/${projectId}/audits/${id}/actions`}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <FileText size={12} />
            Plan d'action ({actionCount})
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditCard;
