
import { CheckCircle, Circle, AlertCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ComplianceStatus } from '@/types/domain';

interface AuditEvaluationCardProps {
  title: string;
  category: string;
  reference?: string;
  importance: string;
  status: ComplianceStatus;
  comment?: string;
  className?: string;
}

/**
 * Carte d'affichage d'une évaluation d'un critère d'audit
 */
export const AuditEvaluationCard = ({
  title,
  category,
  reference,
  importance,
  status,
  comment,
  className,
}: AuditEvaluationCardProps) => {
  // Fonction pour déterminer l'icône en fonction du statut
  const getStatusIcon = () => {
    switch (status) {
      case ComplianceStatus.Compliant:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ComplianceStatus.PartiallyCompliant:
        return <Circle className="h-5 w-5 text-yellow-500" />;
      case ComplianceStatus.NonCompliant:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ComplianceStatus.NotEvaluated:
      case ComplianceStatus.NotApplicable:
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = () => {
    switch (status) {
      case ComplianceStatus.Compliant:
        return "Conforme";
      case ComplianceStatus.PartiallyCompliant:
        return "Partiellement conforme";
      case ComplianceStatus.NonCompliant:
        return "Non conforme";
      case ComplianceStatus.NotEvaluated:
        return "Non évalué";
      case ComplianceStatus.NotApplicable:
        return "Non applicable";
      default:
        return "Inconnu";
    }
  };

  // Fonction pour obtenir la couleur de fond en fonction du statut
  const getStatusColor = () => {
    switch (status) {
      case ComplianceStatus.Compliant:
        return "bg-green-50 border-green-200";
      case ComplianceStatus.PartiallyCompliant:
        return "bg-yellow-50 border-yellow-200";
      case ComplianceStatus.NonCompliant:
        return "bg-red-50 border-red-200";
      case ComplianceStatus.NotEvaluated:
      case ComplianceStatus.NotApplicable:
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card className={cn("border", getStatusColor(), className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">{category}</span>
              {reference && <span className="text-primary">{reference}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center mb-1">
              {getStatusIcon()}
              <span className="ml-1 text-sm font-medium">{getStatusText()}</span>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {importance}
            </span>
          </div>
        </div>
      </CardHeader>
      {comment && (
        <CardContent className="pt-2">
          <p className="text-sm text-muted-foreground">{comment}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default AuditEvaluationCard;
