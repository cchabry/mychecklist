
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';

/**
 * Page des audits d'un projet
 */
const ProjectAuditsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div>
      <PageHeader 
        title="Audits du projet" 
        description="Liste et gestion des audits"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">ID du projet: {projectId}</p>
        <p className="text-muted-foreground">La gestion des audits sera implémentée dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ProjectAuditsPage;
