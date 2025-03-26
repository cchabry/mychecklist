
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';

/**
 * Page des actions correctives d'un projet
 */
const ProjectActionsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div>
      <PageHeader 
        title="Plan d'action" 
        description="Suivi des actions correctives"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">ID du projet: {projectId}</p>
        <p className="text-muted-foreground">Le suivi des actions correctives sera implémenté dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ProjectActionsPage;
