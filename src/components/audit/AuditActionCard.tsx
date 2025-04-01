
import { Calendar, User, Flag, CheckCircle, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ActionPriority, ActionStatus, ComplianceStatus } from '@/types/domain';

interface AuditActionCardProps {
  description: string;
  page: string;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate: string;
  responsible: string;
  targetStatus: ComplianceStatus;
  className?: string;
}

/**
 * Carte d'affichage d'une action corrective
 */
export const AuditActionCard = ({
  description,
  page,
  priority,
  status,
  dueDate,
  responsible,
  targetStatus,
  className,
}: AuditActionCardProps) => {
  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = () => {
    switch (priority) {
      case ActionPriority.Critical:
        return "bg-red-100 text-red-800";
      case ActionPriority.High:
        return "bg-orange-100 text-orange-800";
      case ActionPriority.Medium:
        return "bg-yellow-100 text-yellow-800";
      case ActionPriority.Low:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le texte de priorité
  const getPriorityText = () => {
    switch (priority) {
      case ActionPriority.Critical:
        return "Critique";
      case ActionPriority.High:
        return "Élevée";
      case ActionPriority.Medium:
        return "Moyenne";
      case ActionPriority.Low:
        return "Basse";
      default:
        return "Inconnue";
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = () => {
    switch (status) {
      case ActionStatus.Done:
        return "bg-green-100 text-green-800";
      case ActionStatus.InProgress:
        return "bg-blue-100 text-blue-800";
      case ActionStatus.ToDo:
        return "bg-gray-100 text-gray-800";
      case ActionStatus.Blocked:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = () => {
    switch (status) {
      case ActionStatus.Done:
        return "Terminé";
      case ActionStatus.InProgress:
        return "En cours";
      case ActionStatus.ToDo:
        return "À faire";
      case ActionStatus.Blocked:
        return "Bloqué";
      default:
        return "Inconnu";
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = () => {
    switch (status) {
      case ActionStatus.Done:
        return <CheckCircle className="h-4 w-4" />;
      case ActionStatus.InProgress:
        return <Circle className="h-4 w-4" />;
      case ActionStatus.ToDo:
        return <Clock className="h-4 w-4" />;
      case ActionStatus.Blocked:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn("border hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{description}</CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", getPriorityColor())}>
              <Flag className="h-3 w-3" />
              {getPriorityText()}
            </span>
            <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", getStatusColor())}>
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Page: {page}</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Échéance: {formatDate(dueDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Responsable: {responsible}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditActionCard;
