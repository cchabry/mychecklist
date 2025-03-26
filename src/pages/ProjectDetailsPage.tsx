
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';

/**
 * Page de détail d'un projet
 */
const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div>
      <PageHeader 
        title="Détails du projet" 
        description="Informations et gestion du projet"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">ID du projet: {projectId}</p>
        <p className="text-muted-foreground">Les détails du projet seront implémentés dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
