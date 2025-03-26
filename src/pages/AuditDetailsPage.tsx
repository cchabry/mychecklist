
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/card';

/**
 * Page de détails d'un audit
 */
const AuditDetailsPage = () => {
  const { projectId, auditId } = useParams<{ projectId: string; auditId: string }>();

  return (
    <div>
      <PageHeader 
        title="Détails de l'audit" 
        description="Informations et résultats de l'audit"
      />
      
      <Card className="p-6">
        <p className="text-muted-foreground">
          Détails de l'audit ID: {auditId} du projet ID: {projectId}
        </p>
        <p className="text-muted-foreground mt-4">
          Cette page sera implémentée dans les prochains sprints.
        </p>
      </Card>
    </div>
  );
};

export default AuditDetailsPage;
